import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServiceClient } from "@/lib/supabase-service";
import { markSummariesStale } from "@/lib/ai-helpers";
import { classifyPost } from "@/lib/ai-classify";

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

async function verifyOwnershipOrAdmin(
  supabase: ReturnType<typeof getSupabase>,
  userId: string,
  postId: string
): Promise<{ allowed: boolean; post: { author_id: string; session_id: number } | null }> {
  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role === "Admin") {
    const { data: post } = await getServiceClient()
      .from("posts")
      .select("author_id, session_id")
      .eq("id", postId)
      .single();
    return { allowed: true, post };
  }

  // Check ownership
  const { data: post } = await supabase
    .from("posts")
    .select("author_id, session_id")
    .eq("id", postId)
    .single();

  if (!post) return { allowed: false, post: null };
  return { allowed: post.author_id === userId, post };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed, post: existingPost } = await verifyOwnershipOrAdmin(supabase, user.id, params.id);
  if (!allowed || !existingPost) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, body: postBody } = body;

  if (!title || !postBody) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }

  // Re-run auto-classification
  let category = "Live Insight";
  try {
    category = await classifyPost(title, postBody);
  } catch {}

  // Use service client to bypass RLS for admin edits
  const { data, error } = await getServiceClient()
    .from("posts")
    .update({ title, body: postBody, category })
    .eq("id", params.id)
    .select("*, profiles(username, role)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark summaries stale
  try {
    const { data: sess } = await getServiceClient()
      .from("sessions")
      .select("day_number")
      .eq("id", existingPost.session_id)
      .single();
    if (sess) {
      await markSummariesStale(getServiceClient(), existingPost.session_id, sess.day_number);
    }
  } catch {}

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed, post: existingPost } = await verifyOwnershipOrAdmin(supabase, user.id, params.id);
  if (!allowed || !existingPost) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await getServiceClient()
    .from("posts")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark summaries stale
  try {
    const { data: sess } = await getServiceClient()
      .from("sessions")
      .select("day_number")
      .eq("id", existingPost.session_id)
      .single();
    if (sess) {
      await markSummariesStale(getServiceClient(), existingPost.session_id, sess.day_number);
    }
  } catch {}

  return NextResponse.json({ success: true });
}
