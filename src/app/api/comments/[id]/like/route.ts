import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const commentId = parseInt(params.id, 10);
  if (isNaN(commentId)) {
    return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
  }

  // Check if like already exists
  const { data: existing } = await supabase
    .from("comment_likes")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    // Unlike: delete the row
    await supabase
      .from("comment_likes")
      .delete()
      .eq("id", existing.id);
  } else {
    // Like: insert a row
    const { error } = await supabase
      .from("comment_likes")
      .insert({ comment_id: commentId, user_id: user.id });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Read authoritative like_count after trigger has run
  const { data: comment } = await supabase
    .from("comments")
    .select("like_count")
    .eq("id", commentId)
    .single();

  return NextResponse.json({
    liked: !existing,
    like_count: comment?.like_count ?? 0,
  });
}
