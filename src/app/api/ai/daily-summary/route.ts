import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getAnthropicClient, AI_MODEL } from "@/lib/anthropic";

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

  const { posts_context, day_number, day_name, session_titles } = await request.json();
  if (day_number === undefined || day_number === null) {
    return NextResponse.json({ error: "day_number is required" }, { status: 400 });
  }
  if (!posts_context) {
    return NextResponse.json({ error: "posts_context is required" }, { status: 400 });
  }

  try {
    const anthropic = getAnthropicClient();

    const systemPrompt = `You are an AI analyst for the Cambridge AI Leadership Programme — a week-long executive programme at Cambridge Judge Business School.

Synthesise the following posts and discussions from Day ${day_number} (${day_name || ""}) into an executive daily summary.

Sessions today: ${(session_titles || []).join(", ")}

Return ONLY valid JSON:
{
  "executive_narrative": "2-3 flowing paragraphs summarising the day's discussions, insights, and debates. Be specific — name people, reference actual arguments. Write for senior executives who want substance, not fluff. British English.",
  "cross_cutting_themes": ["3-5 themes that connected across sessions"],
  "open_questions": ["2-3 questions that emerged but weren't resolved"],
  "session_highlights": [{"session_title": "Session Name", "key_points": ["2-3 key points from this session"]}]
}

Only reference content that exists in the data. Do NOT invent content.`;

    const timeoutMs = 25_000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response;
    try {
      response = await anthropic.messages.create(
        {
          model: AI_MODEL,
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: "user", content: posts_context }],
        },
        { signal: controller.signal }
      );
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === "AbortError") {
        return NextResponse.json(
          { error: "The AI is taking too long. Try again." },
          { status: 504 }
        );
      }
      throw err;
    }
    clearTimeout(timer);

    if (!response.content || response.content.length === 0) {
      return NextResponse.json({ error: "AI returned empty response" }, { status: 502 });
    }

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "AI returned invalid response" }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Daily summary error:", err);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
