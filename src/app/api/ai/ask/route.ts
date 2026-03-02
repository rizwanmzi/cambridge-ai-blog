import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServiceClient } from "@/lib/supabase-service";
import { getAnthropicClient, AI_MODEL, TONE_INSTRUCTION } from "@/lib/anthropic";

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

  const { question, conversation_history } = await request.json();
  if (!question) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  try {
    // Fetch ALL posts with profiles and sessions
    const { data: posts } = await getServiceClient()
      .from("posts")
      .select("id, title, body, category, profiles(username, role), sessions(id, title)")
      .order("created_at", { ascending: true });

    // Fetch ALL comments with profiles
    const { data: comments } = await getServiceClient()
      .from("comments")
      .select("id, body, post_id, session_id, profiles(username, role)")
      .order("created_at", { ascending: true });

    const postsContext = (posts || [])
      .map((p) => {
        const profile = p.profiles as unknown as { username: string; role: string } | null;
        const session = p.sessions as unknown as { id: number; title: string } | null;
        const postComments = (comments || [])
          .filter((c) => c.post_id === p.id)
          .map((c) => {
            const cp = c.profiles as unknown as { username: string; role: string } | null;
            return `  Comment by ${cp?.username ?? "Unknown"} (${cp?.role ?? "Unknown"}): ${c.body}`;
          })
          .join("\n");
        return `[Post ID:${p.id}] "${p.title}" by ${profile?.username ?? "Unknown"} (${profile?.role ?? "Unknown"}) in session "${session?.title ?? "Unknown"}" [Session ID:${session?.id ?? "?"}]\nCategory: ${p.category}\n${p.body}${postComments ? `\nComments:\n${postComments}` : ""}`;
      })
      .join("\n\n---\n\n");

    const systemPrompt = `${TONE_INSTRUCTION}

You are the programme's AI assistant. You answer questions using ONLY the content from posts, comments, and session discussions below. You also have knowledge of three pre-readings assigned to the cohort:
1. "Generative AI Has a Visual Plagiarism Problem" (IEEE Spectrum) — AI models reproducing copyrighted visual styles
2. "The Complex World of Style, Copyright, and Generative AI" (Creative Commons) — style, copyright law, and AI
3. "AI 2027" — scenario-based exploration of near-term AI capability development

Rules:
- Answer from programme content. Cite specific posts by title and author name.
- If referencing a session, name it: "In the Machine Learning session on Day 1..."
- If the question wasn't covered in the programme, say so directly, then offer the closest related discussion.
- Be conversational and specific. No waffle.
- If attendees disagreed on a topic, present both sides.
- British English.

When you reference a post, include its Post ID and Session ID so they can be linked.

Return ONLY valid JSON:
{
  "answer": "Your detailed answer with citations...",
  "sources": [{"post_id": 123, "title": "Post Title", "session_title": "Session Title"}]
}

Programme Content:
${postsContext || "No posts yet."}`;

    // Build messages with conversation history
    const messages: { role: "user" | "assistant"; content: string }[] = [];
    if (conversation_history) {
      for (const msg of conversation_history) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
    messages.push({ role: "user", content: question });

    const anthropic = getAnthropicClient();

    // 25-second timeout for the Claude call
    const timeoutMs = 25_000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response;
    try {
      response = await anthropic.messages.create(
        {
          model: AI_MODEL,
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        },
        { signal: controller.signal }
      );
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === "AbortError") {
        return NextResponse.json(
          { error: "The AI is taking too long. Try a simpler question." },
          { status: 504 }
        );
      }
      throw err;
    }
    clearTimeout(timer);

    if (!response.content || response.content.length === 0) {
      return NextResponse.json({ answer: "I couldn't generate a response. Please try again.", sources: [] });
    }

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Claude returned non-JSON — return raw text as the answer
      return NextResponse.json({ answer: cleaned || text, sources: [] });
    }

    // Validate the answer field
    if (!parsed.answer || typeof parsed.answer !== "string" || !parsed.answer.trim()) {
      return NextResponse.json({ answer: "I couldn't generate a response. Please try again.", sources: parsed.sources || [] });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Ask error:", err);
    return NextResponse.json({ error: "Failed to answer question" }, { status: 500 });
  }
}
