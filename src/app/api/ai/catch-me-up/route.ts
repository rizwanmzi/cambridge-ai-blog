import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { generateDaySummary } from "@/lib/ai-generate";
import { callClaude, TONE_INSTRUCTION, SummaryContent } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
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

  const { last_day_seen } = await request.json();
  if (last_day_seen === undefined || last_day_seen === null) {
    return NextResponse.json({ error: "last_day_seen is required" }, { status: 400 });
  }

  try {
    // Fetch day summaries for days after last_day_seen
    const missedDays: { day: number; summary: SummaryContent }[] = [];
    for (let d = last_day_seen + 1; d <= 5; d++) {
      const summary = await generateDaySummary(d);
      missedDays.push({ day: d, summary });
    }

    if (missedDays.length === 0) {
      return NextResponse.json({
        briefing: "You're all caught up! Nothing new since you last checked in.",
      });
    }

    const daysText = missedDays
      .map(
        (d) =>
          `Day ${d.day}:\nThemes: ${d.summary.themes.map((t) => t.title).join(", ")}\nSo What: ${d.summary.so_what}\nNarrative: ${d.summary.narrative}\nOpen Questions: ${d.summary.open_questions.join("; ")}`
      )
      .join("\n\n---\n\n");

    const systemPrompt = `${TONE_INSTRUCTION}

You are giving a personalised catch-up briefing. The participant missed some days.
Tone: "Right, so here's what you missed..."
Be warm, specific, and make them feel like they're being brought into the loop by a friend.
Return ONLY valid JSON:
{
  "themes": [{"title": "...", "description": "..."}],
  "quotes": [{"text": "...", "author": "...", "role": "..."}],
  "open_questions": ["..."],
  "tensions": [{"description": "..."}],
  "action_items": ["..."],
  "real_world": [{"description": "..."}],
  "so_what": "Your personalised catch-up takeaway",
  "narrative": "A friendly 2-3 paragraph briefing starting with 'Right, so here\\'s what you missed...'"
}`;

    const raw = await callClaude(systemPrompt, `Days missed:\n\n${daysText}`);
    const briefing = JSON.parse(raw);

    return NextResponse.json({ briefing });
  } catch (err) {
    console.error("Catch-me-up error:", err);
    return NextResponse.json({ error: "Failed to generate briefing" }, { status: 500 });
  }
}
