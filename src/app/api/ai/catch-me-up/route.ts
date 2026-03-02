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

    const missedDayNumbers = missedDays.map((d) => d.day).join(", ");
    const nextDay = missedDays[missedDays.length - 1].day + 1;

    const summariesBlock = missedDays
      .map(
        (d) =>
          `Day ${d.day}:\nThemes: ${d.summary.themes.map((t) => t.title).join(", ")}\nSo What: ${d.summary.so_what}\nNarrative: ${d.summary.narrative}\nOpen Questions: ${d.summary.open_questions.join("; ")}\nSurprise: ${d.summary.surprise || "N/A"}`
      )
      .join("\n\n---\n\n");

    const systemPrompt = `${TONE_INSTRUCTION}

Someone missed Days ${missedDayNumbers} of the programme and needs catching up fast. Below are the day summaries for what they missed.

${summariesBlock}

Write a catch-up briefing. Start with: "Right, so here's what you missed..."

Be direct, warm, and prioritise what actually matters. Don't list every session — focus on the moments, debates, and insights they need to know about to not feel lost when they walk into the next session.

Structure it as flowing paragraphs, not bullet points. End with: "The big question going into Day ${nextDay > 5 ? "the next phase" : nextDay} is..." to set them up.

Keep it under 500 words unless they missed 3+ days.

Return ONLY valid JSON:
{
  "narrative": "The catch-up briefing as described above",
  "so_what": "One-sentence summary of what they missed"
}`;

    const raw = await callClaude(systemPrompt, "Generate the catch-up briefing now.");
    let briefing;
    try {
      briefing = JSON.parse(raw);
    } catch {
      console.error("Failed to parse catch-up briefing JSON, raw:", raw);
      return NextResponse.json({ error: "AI returned invalid response" }, { status: 502 });
    }

    return NextResponse.json({ briefing });
  } catch (err) {
    console.error("Catch-me-up error:", err);
    return NextResponse.json({ error: "Failed to generate briefing" }, { status: 500 });
  }
}
