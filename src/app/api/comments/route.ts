import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServiceClient } from "@/lib/supabase-service";
import { markSummariesStale } from "@/lib/ai-helpers";

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
          } catch {
            // Read-only in some contexts
          }
        },
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { post_id, session_id, body: commentBody } = body;

  if (!commentBody) {
    return NextResponse.json({ error: "Body is required" }, { status: 400 });
  }

  // Must have exactly one target
  if ((!post_id && !session_id) || (post_id && session_id)) {
    return NextResponse.json(
      { error: "Provide either post_id or session_id, not both" },
      { status: 400 }
    );
  }

  const insertData: Record<string, unknown> = { user_id: user.id, body: commentBody };
  if (post_id) insertData.post_id = post_id;
  if (session_id) insertData.session_id = session_id;

  const { data, error } = await supabase
    .from("comments")
    .insert(insertData)
    .select("*, profiles(username, role)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Best-effort: mark AI summaries stale
  try {
    let resolvedSessionId = session_id;
    if (!resolvedSessionId && post_id) {
      const { data: post } = await getServiceClient()
        .from("posts")
        .select("session_id")
        .eq("id", post_id)
        .single();
      resolvedSessionId = post?.session_id;
    }
    if (resolvedSessionId) {
      const { data: sess } = await getServiceClient()
        .from("sessions")
        .select("day_number")
        .eq("id", resolvedSessionId)
        .single();
      if (sess) {
        await markSummariesStale(getServiceClient(), resolvedSessionId, sess.day_number);
      }
    }
  } catch {
    // Non-critical
  }

  return NextResponse.json(data, { status: 201 });
}
