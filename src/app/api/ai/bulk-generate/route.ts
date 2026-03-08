import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServiceClient } from "@/lib/supabase-service";
import { generateSessionSummary } from "@/lib/ai-generate";

export const maxDuration = 300; // 5 minutes for Vercel

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  // Auth: either service key header OR cookie-based admin auth
  const authHeader = request.headers.get("x-api-key");
  if (authHeader && authHeader === process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Authenticated via service key — proceed
  } else {
    // Fall back to cookie-based admin auth
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
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "Admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }
  }

  // Get all sessions
  const { data: sessions } = await getServiceClient()
    .from("sessions")
    .select("id, title")
    .order("id");

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ message: "No sessions found", results: [] });
  }

  // Check which sessions have posts
  const { data: postCounts } = await getServiceClient()
    .from("posts")
    .select("session_id");

  const sessionsWithPosts = new Set<number>();
  if (postCounts) {
    for (const p of postCounts) {
      sessionsWithPosts.add(p.session_id);
    }
  }

  const force = body.force || false;
  const results: { id: number; title: string; status: string }[] = [];

  for (const session of sessions) {
    if (!sessionsWithPosts.has(session.id)) {
      results.push({ id: session.id, title: session.title, status: "skipped (no posts)" });
      continue;
    }

    if (!force) {
      const { data: cached } = await getServiceClient()
        .from("ai_summaries")
        .select("is_stale")
        .eq("scope", "session")
        .eq("session_id", session.id)
        .single();

      if (cached && !cached.is_stale) {
        results.push({ id: session.id, title: session.title, status: "skipped (fresh cache)" });
        continue;
      }
    }

    try {
      await generateSessionSummary(session.id);
      results.push({ id: session.id, title: session.title, status: "generated" });
    } catch (err) {
      results.push({ id: session.id, title: session.title, status: `error: ${err}` });
    }
  }

  return NextResponse.json({
    message: `Processed ${results.length} sessions`,
    results,
  });
}
