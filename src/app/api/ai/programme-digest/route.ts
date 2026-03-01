import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { generateProgrammeDigest } from "@/lib/ai-generate";
import { getServiceClient } from "@/lib/supabase-service";

export async function POST() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { summary, postCount, commentCount, sessionCount } = await generateProgrammeDigest();

    // Leaderboard: top 5 contributors
    const { data: posts } = await getServiceClient()
      .from("posts")
      .select("id, title, author_id, profiles(username, role)");

    const { data: allComments } = await getServiceClient()
      .from("comments")
      .select("id, post_id, user_id, profiles(username, role)");

    // Count contributions per user
    const contributions: Record<string, { username: string; role: string; count: number }> = {};
    for (const p of posts || []) {
      const profile = p.profiles as unknown as { username: string; role: string } | null;
      if (profile) {
        const key = profile.username;
        if (!contributions[key]) contributions[key] = { username: key, role: profile.role, count: 0 };
        contributions[key].count++;
      }
    }
    for (const c of allComments || []) {
      const profile = c.profiles as unknown as { username: string; role: string } | null;
      if (profile) {
        const key = profile.username;
        if (!contributions[key]) contributions[key] = { username: key, role: profile.role, count: 0 };
        contributions[key].count++;
      }
    }
    const topContributors = Object.values(contributions)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Most discussed post (most comments)
    const commentCounts: Record<number, number> = {};
    for (const c of allComments || []) {
      if (c.post_id) {
        commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
      }
    }
    let mostDiscussedPost = null;
    const topPostId = Object.entries(commentCounts).sort(([, a], [, b]) => b - a)[0];
    if (topPostId && posts) {
      const post = posts.find((p) => p.id === Number(topPostId[0]));
      if (post) {
        mostDiscussedPost = { id: post.id, title: post.title, comment_count: topPostId[1] };
      }
    }

    // Most engaged question (open question from any session summary with most overlap)
    const { data: sessionSummaries } = await getServiceClient()
      .from("ai_summaries")
      .select("content")
      .eq("scope", "session");

    const questionFreq: Record<string, number> = {};
    for (const s of sessionSummaries || []) {
      const content = s.content as { open_questions?: string[] };
      for (const q of content.open_questions || []) {
        questionFreq[q] = (questionFreq[q] || 0) + 1;
      }
    }
    const questionOfTheWeek = Object.entries(questionFreq).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    return NextResponse.json({
      summary,
      postCount,
      commentCount,
      sessionCount,
      leaderboard: {
        topContributors,
        mostDiscussedPost,
        questionOfTheWeek,
      },
    });
  } catch (err) {
    console.error("Programme digest error:", err);
    return NextResponse.json({ error: "Failed to generate digest" }, { status: 500 });
  }
}
