import { getServiceClient } from "./supabase-service";
import { callClaude, TONE_INSTRUCTION, SummaryContent } from "./anthropic";

export async function generateSessionSummary(
  sessionId: number
): Promise<SummaryContent> {
  // Check cache
  const { data: cached } = await getServiceClient()
    .from("ai_summaries")
    .select("content")
    .eq("scope", "session")
    .eq("session_id", sessionId)
    .eq("is_stale", false)
    .single();

  if (cached) return cached.content as SummaryContent;

  // Fetch session info
  const { data: session } = await getServiceClient()
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  // Fetch posts with profiles
  const { data: posts } = await getServiceClient()
    .from("posts")
    .select("*, profiles(username, role)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  // Fetch session comments with profiles
  const { data: comments } = await getServiceClient()
    .from("comments")
    .select("*, profiles(username, role)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const postsText = (posts || [])
    .map(
      (p: { title: string; body: string; category: string; profiles: { username: string; role: string } | null }) =>
        `[${p.category}] "${p.title}" by ${p.profiles?.username ?? "Unknown"} (${p.profiles?.role ?? "Unknown"}):\n${p.body}`
    )
    .join("\n\n---\n\n");

  const commentsText = (comments || [])
    .map(
      (c: { body: string; profiles: { username: string; role: string } | null }) =>
        `${c.profiles?.username ?? "Unknown"} (${c.profiles?.role ?? "Unknown"}): ${c.body}`
    )
    .join("\n");

  const contentBlock = [
    postsText && `Posts:\n${postsText}`,
    commentsText && `Session Discussion:\n${commentsText}`,
  ]
    .filter(Boolean)
    .join("\n\n") || "No content yet.";

  const systemPrompt = `${TONE_INSTRUCTION}

You're summarising a session from the programme. Below are all the posts and comments written by attendees about this session.

Session: "${session?.title ?? "Unknown"}" (Day ${session?.day_number ?? "?"}, ${session?.faculty || "faculty not specified"})

Content from attendees:
${contentBlock}

Generate a structured summary as JSON with these exact fields:

{
  "themes": [
    {"title": "Short theme name", "description": "2-3 sentences. Be specific — what was the actual argument or insight? Reference who said it if known."}
  ],
  "quotes": [
    {"text": "Exact or near-exact quote from a post/comment", "author": "username", "role": "their role"}
  ],
  "open_questions": ["Questions that were raised but not resolved. Frame them as the room would have asked them — conversational, not academic."],
  "tensions": [
    {"description": "Where people disagreed or where the discussion revealed a genuine dilemma. Be specific."}
  ],
  "action_items": ["Practical implications — what should these leaders actually do differently based on this session?"],
  "real_world": [
    {"description": "Specific connections attendees made to their own industries, companies, or decisions they face."}
  ],
  "so_what": "The single most important thing from this session in 2 sentences. If someone only reads this, they should get the point.",
  "narrative": "3-5 paragraphs telling the story of this session's discussion. Start with the moment that mattered most, not a chronological recap. What surprised people? Where did minds change? What's the thing everyone will still be talking about at dinner? Write it like you're telling a smart friend over a drink."
}

Return 3-4 themes, 2-3 quotes (only if genuine quotes exist in the content — don't fabricate), 2-4 open questions, 1-3 tensions, 2-4 action items, 1-3 real-world connections.

If there's very little content (1-2 short posts), scale down proportionally — a single post doesn't need 4 themes. Be honest: "Early days — only one post so far, but here's what stood out."

Return ONLY valid JSON, no markdown fences.`;

  const userPrompt = "Generate the session summary now.";

  const raw = await callClaude(systemPrompt, userPrompt);
  const content: SummaryContent = JSON.parse(raw);

  // Upsert cache
  await getServiceClient().from("ai_summaries").upsert(
    {
      session_id: sessionId,
      day_number: null,
      scope: "session",
      content,
      generated_at: new Date().toISOString(),
      is_stale: false,
    },
    { onConflict: "session_id" }
  );

  return content;
}

export async function generateDaySummary(
  dayNumber: number
): Promise<SummaryContent> {
  // Check cache
  const { data: cached } = await getServiceClient()
    .from("ai_summaries")
    .select("content")
    .eq("scope", "day")
    .eq("day_number", dayNumber)
    .eq("is_stale", false)
    .single();

  if (cached) return cached.content as SummaryContent;

  // Fetch sessions for this day
  const { data: sessions } = await getServiceClient()
    .from("sessions")
    .select("id, title, faculty")
    .eq("day_number", dayNumber)
    .eq("is_social", false)
    .order("start_time");

  // Generate/fetch session summaries for each session
  const sessionSummaries: { title: string; faculty: string | null; summary: SummaryContent }[] = [];
  for (const s of sessions || []) {
    const summary = await generateSessionSummary(s.id);
    sessionSummaries.push({ title: s.title, faculty: s.faculty, summary });
  }

  const sessionSummariesBlock = sessionSummaries
    .map(
      (s) =>
        `Session: "${s.title}" (${s.faculty ?? "N/A"})\nThemes: ${s.summary.themes.map((t) => t.title).join(", ")}\nSo What: ${s.summary.so_what}\nNarrative: ${s.summary.narrative}\nOpen Questions: ${s.summary.open_questions.join("; ")}`
    )
    .join("\n\n---\n\n");

  const systemPrompt = `${TONE_INSTRUCTION}

You're writing the daily digest for Day ${dayNumber} of the programme. Below are the AI-generated summaries for each session that day.

${sessionSummariesBlock || "No sessions."}

Write a day-level synthesis that captures the arc of the day — not just a list of what happened in each session. What threads connected? What built on what? Where did the day surprise people?

Return JSON:
{
  "themes": [{"title": "...", "description": "Cross-cutting theme across sessions, 2-3 sentences"}],
  "narrative": "4-6 paragraphs. Tell the story of the day. Start with the dominant mood or breakthrough. Weave the sessions together — show how the morning's discussion set up the afternoon's debate. End with what people are buzzing about heading into dinner.",
  "so_what": "The day in one sentence.",
  "open_questions": ["The questions the group is carrying into tomorrow"],
  "surprise": "The one thing nobody expected from today"
}

Return ONLY valid JSON.`;

  const raw = await callClaude(systemPrompt, "Generate the day summary now.");
  const content: SummaryContent = JSON.parse(raw);

  await getServiceClient().from("ai_summaries").upsert(
    {
      session_id: null,
      day_number: dayNumber,
      scope: "day",
      content,
      generated_at: new Date().toISOString(),
      is_stale: false,
    },
    { onConflict: "day_number" }
  );

  return content;
}

export interface ProgrammeDigestResult {
  summary: SummaryContent;
  postCount: number;
  commentCount: number;
  sessionCount: number;
}

export async function generateProgrammeDigest(): Promise<ProgrammeDigestResult> {
  // Check cache
  const { data: cached } = await getServiceClient()
    .from("ai_summaries")
    .select("content")
    .eq("scope", "programme")
    .eq("is_stale", false)
    .single();

  if (cached) {
    // Still need counts for the footer even when cached
    const { count: postCount } = await getServiceClient()
      .from("posts")
      .select("id", { count: "exact", head: true });
    const { count: commentCount } = await getServiceClient()
      .from("comments")
      .select("id", { count: "exact", head: true })
      .not("post_id", "is", null);
    const { data: sessionRows } = await getServiceClient()
      .from("posts")
      .select("session_id")
      .not("session_id", "is", null);
    const sessionCount = new Set((sessionRows || []).map((r: { session_id: number }) => r.session_id)).size;

    return {
      summary: cached.content as SummaryContent,
      postCount: postCount ?? 0,
      commentCount: commentCount ?? 0,
      sessionCount,
    };
  }

  // Fetch ALL posts with profiles and session info
  const { data: posts } = await getServiceClient()
    .from("posts")
    .select("*, profiles(username, role), sessions(title, day_number, session_date)")
    .order("created_at");

  // Fetch ALL comments on posts with profiles
  const { data: comments } = await getServiceClient()
    .from("comments")
    .select("*, profiles(username, role)")
    .not("post_id", "is", null)
    .order("created_at");

  const allPosts = posts || [];
  const allComments = comments || [];

  // If no posts, return empty result
  if (allPosts.length === 0) {
    return {
      summary: {
        themes: [],
        quotes: [],
        open_questions: [],
        tensions: [],
        action_items: [],
        real_world: [],
        so_what: "",
        narrative: "",
      },
      postCount: 0,
      commentCount: 0,
      sessionCount: 0,
    };
  }

  // Group posts by session
  const sessionMap = new Map<number, {
    title: string;
    dayNumber: number | null;
    sessionDate: string | null;
    posts: typeof allPosts;
  }>();

  for (const p of allPosts) {
    const session = p.sessions as unknown as { title: string; day_number: number | null; session_date: string | null } | null;
    const sid = p.session_id as number;
    if (!sessionMap.has(sid)) {
      sessionMap.set(sid, {
        title: session?.title ?? "Unknown Session",
        dayNumber: session?.day_number ?? null,
        sessionDate: session?.session_date ?? null,
        posts: [],
      });
    }
    sessionMap.get(sid)!.posts.push(p);
  }

  // Build comment lookup by post_id
  const commentsByPost = new Map<number, typeof allComments>();
  for (const c of allComments) {
    const pid = c.post_id as number;
    if (!commentsByPost.has(pid)) commentsByPost.set(pid, []);
    commentsByPost.get(pid)!.push(c);
  }

  // Build structured context
  const contextParts: string[] = [];
  for (const [, session] of Array.from(sessionMap.entries())) {
    const dayLabel = session.dayNumber != null ? `Day ${session.dayNumber}` : "Pre-programme";
    const dateLabel = session.sessionDate ?? "date unknown";
    contextParts.push(`SESSION: ${session.title} (${dayLabel}, ${dateLabel})`);

    for (const p of session.posts) {
      const profile = p.profiles as unknown as { username: string; role: string } | null;
      const author = profile?.username ?? "Unknown";
      const category = p.category ?? "general";
      const timestamp = p.created_at ? new Date(p.created_at).toISOString().slice(0, 16) : "";
      contextParts.push(`  POST by ${author} (${category}, ${timestamp}):`);
      contextParts.push(`  ${p.body}`);

      const postComments = commentsByPost.get(p.id) || [];
      for (const c of postComments) {
        const cProfile = c.profiles as unknown as { username: string; role: string } | null;
        const cAuthor = cProfile?.username ?? "Unknown";
        const cTimestamp = c.created_at ? new Date(c.created_at).toISOString().slice(0, 16) : "";
        contextParts.push(`    COMMENT by ${cAuthor} (${cTimestamp}): ${c.body}`);
      }
    }
    contextParts.push(""); // blank line between sessions
  }

  const structuredContext = contextParts.join("\n");
  const sessionCount = sessionMap.size;

  const systemPrompt = `You are an AI analyst for the Cambridge AI Leadership Programme. Below is the complete set of posts and comments from programme participants. Synthesise this into a digest.

Include: key themes emerging across sessions, notable insights from participants, areas of debate or disagreement in comments, and connections between sessions. Only reference content that actually exists in the data below. Do NOT invent or hallucinate any content. If there are no posts for a session, say so.

${TONE_INSTRUCTION}

DATA:
${structuredContext}

Return JSON:
{
  "executive_summary": "3-4 paragraphs. The story of the programme so far based on what participants actually wrote.",
  "top_insights": ["The most important ideas from the posts, ranked by impact. Each one sentence, specific, actionable."],
  "themes": [{"title": "...", "description": "Major theme from the actual posts, 2-3 sentences"}],
  "evolution": "How has the group's thinking evolved based on their posts?",
  "unresolved": ["Questions or tensions that remain unresolved in the discussions"],
  "so_what": "The programme in two sentences based on what participants have shared.",
  "narrative": "3-5 paragraphs telling the story of the programme based on real posts and comments."
}

Return ONLY valid JSON.`;

  const raw = await callClaude(systemPrompt, "Generate the programme digest now.");
  const content: SummaryContent = JSON.parse(raw);

  // Cache the result
  const { data: existing } = await getServiceClient()
    .from("ai_summaries")
    .select("id")
    .eq("scope", "programme")
    .single();

  if (existing) {
    await getServiceClient()
      .from("ai_summaries")
      .update({
        content,
        generated_at: new Date().toISOString(),
        is_stale: false,
      })
      .eq("id", existing.id);
  } else {
    await getServiceClient().from("ai_summaries").insert({
      session_id: null,
      day_number: null,
      scope: "programme",
      content,
      generated_at: new Date().toISOString(),
      is_stale: false,
    });
  }

  return {
    summary: content,
    postCount: allPosts.length,
    commentCount: allComments.length,
    sessionCount,
  };
}
