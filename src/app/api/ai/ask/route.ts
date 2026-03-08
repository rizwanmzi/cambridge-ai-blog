import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServiceClient } from "@/lib/supabase-service";
import { getAnthropicClient, AI_MODEL, TONE_INSTRUCTION } from "@/lib/anthropic";
import fs from "fs";
import path from "path";

// Load programme notes once at module level
let programmeNotes = "";
try {
  programmeNotes = fs.readFileSync(
    path.join(process.cwd(), "docs", "programme-notes.txt"),
    "utf8"
  );
} catch {
  // Notes file not available — continue without it
}

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

You are the AI assistant for the Cambridge AI Leadership Programme. You ONLY answer questions that relate to the programme, its sessions, AI, machine learning, technology strategy, or topics connected to what was covered during the week. If someone asks something completely unrelated (e.g. recipes, sports scores, personal advice unrelated to AI), politely decline and redirect them to ask about the programme.

You have two sources of knowledge:
1. Participant posts and comments (below) -- cite these by title and author when relevant.
2. Deep background knowledge of what was covered in each session (themes, debates, exercises, frameworks, examples). Use this naturally as if you were in the room. NEVER reference "notes", "a document", "session notes", or any written source. Speak as someone who attended and absorbed every session.

Rules:
- Only answer questions related to the programme, AI, or connected topics.
- When participants wrote about a topic, cite their posts by title and author name.
- When a topic was covered in a session but no participant wrote about it, reference the session naturally: "In the Machine Learning session on Day 1..." without citing a written source.
- If attendees disagreed, present both sides.
- Be conversational and specific. No waffle.
- British English.
- Never use emojis.
- Use markdown headings (## or ###) for section titles, not bold. Use bullet points for lists. Keep formatting clean.
- Do not invent or fabricate quotes. Only quote what appears in participant posts.

When you reference a post, include its Post ID and Session ID so they can be linked.

Return ONLY valid JSON:
{
  "answer": "Your detailed answer here...",
  "sources": [{"post_id": 123, "title": "Post Title", "session_title": "Session Title"}]
}
${programmeNotes ? `\nProgramme Background Knowledge:\n${programmeNotes}\n` : ""}
Participant Posts and Comments:
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
