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

You are answering questions about the Cambridge AI Leadership Programme.
IMPORTANT: Only answer from the programme content provided below. If the answer isn't in the content, say so.
Always cite specific posts and usernames when referencing content.
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
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Ask error:", err);
    return NextResponse.json({ error: "Failed to answer question" }, { status: 500 });
  }
}
