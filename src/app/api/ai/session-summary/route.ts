import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSessionSummary, generateSessionSummary } from "@/lib/ai-generate";

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

  const { session_id, regenerate } = await request.json();
  if (!session_id) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  try {
    // If regenerate requested (admin action), force fresh generation
    if (regenerate) {
      const summary = await generateSessionSummary(session_id);
      return NextResponse.json({
        summary,
        generated_at: new Date().toISOString(),
        is_stale: false,
      });
    }

    // Otherwise: return cached summary instantly (even if stale)
    const cached = await getSessionSummary(session_id);
    if (cached) {
      return NextResponse.json({
        summary: cached.content,
        generated_at: cached.generated_at,
        is_stale: cached.is_stale,
      });
    }

    // No cached summary at all — generate fresh
    const summary = await generateSessionSummary(session_id);
    return NextResponse.json({
      summary,
      generated_at: new Date().toISOString(),
      is_stale: false,
    });
  } catch (err) {
    console.error("Session summary error:", err);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
