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

  const systemPrompt = `${TONE_INSTRUCTION}

You are summarising a single session from the Cambridge AI Leadership Programme.
Return ONLY valid JSON matching this structure (no markdown, no explanation):
{
  "themes": [{"title": "...", "description": "..."}],
  "quotes": [{"text": "...", "author": "...", "role": "..."}],
  "open_questions": ["..."],
  "tensions": [{"description": "..."}],
  "action_items": ["..."],
  "real_world": [{"description": "..."}],
  "so_what": "One-paragraph takeaway",
  "narrative": "A 2-3 paragraph narrative summary telling the story of this session"
}`;

  const userPrompt = `Session: "${session?.title ?? "Unknown"}"
Faculty: ${session?.faculty ?? "N/A"}
Description: ${session?.description ?? "N/A"}

Posts:
${postsText || "No posts yet."}

Session Discussion:
${commentsText || "No comments yet."}`;

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

  const sessionsText = sessionSummaries
    .map(
      (s) =>
        `Session: "${s.title}" (${s.faculty ?? "N/A"})\nThemes: ${s.summary.themes.map((t) => t.title).join(", ")}\nSo What: ${s.summary.so_what}\nNarrative: ${s.summary.narrative}`
    )
    .join("\n\n---\n\n");

  const systemPrompt = `${TONE_INSTRUCTION}

You are synthesising a full day of the Cambridge AI Leadership Programme.
You have session summaries below. Weave them into a coherent day-level summary.
Return ONLY valid JSON matching this structure:
{
  "themes": [{"title": "...", "description": "..."}],
  "quotes": [{"text": "...", "author": "...", "role": "..."}],
  "open_questions": ["..."],
  "tensions": [{"description": "..."}],
  "action_items": ["..."],
  "real_world": [{"description": "..."}],
  "so_what": "One-paragraph day takeaway",
  "narrative": "A 2-3 paragraph narrative of the day's learning arc"
}`;

  const raw = await callClaude(systemPrompt, `Day ${dayNumber} Sessions:\n\n${sessionsText || "No sessions."}`);
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

export async function generateProgrammeDigest(): Promise<SummaryContent> {
  // Check cache
  const { data: cached } = await getServiceClient()
    .from("ai_summaries")
    .select("content")
    .eq("scope", "programme")
    .eq("is_stale", false)
    .single();

  if (cached) return cached.content as SummaryContent;

  // Generate/fetch day summaries for all days
  const daySummaries: { day: number; summary: SummaryContent }[] = [];
  for (let d = 0; d <= 5; d++) {
    const summary = await generateDaySummary(d);
    daySummaries.push({ day: d, summary });
  }

  const daysText = daySummaries
    .map(
      (d) =>
        `Day ${d.day}:\nThemes: ${d.summary.themes.map((t) => t.title).join(", ")}\nSo What: ${d.summary.so_what}\nNarrative: ${d.summary.narrative}`
    )
    .join("\n\n---\n\n");

  const systemPrompt = `${TONE_INSTRUCTION}

You are creating the definitive programme digest for the entire Cambridge AI Leadership Programme.
Synthesise the day summaries into a comprehensive programme-level overview.
Return ONLY valid JSON matching this structure:
{
  "themes": [{"title": "...", "description": "..."}],
  "quotes": [{"text": "...", "author": "...", "role": "..."}],
  "open_questions": ["..."],
  "tensions": [{"description": "..."}],
  "action_items": ["..."],
  "real_world": [{"description": "..."}],
  "so_what": "The definitive programme takeaway",
  "narrative": "A 3-4 paragraph narrative of the entire programme's learning journey"
}`;

  const raw = await callClaude(systemPrompt, `Programme Day Summaries:\n\n${daysText}`);
  const content: SummaryContent = JSON.parse(raw);

  // Use a raw upsert for programme scope (unique index on constant 1)
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

  return content;
}
