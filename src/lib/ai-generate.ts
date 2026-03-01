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

