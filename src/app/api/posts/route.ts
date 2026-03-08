import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServiceClient } from "@/lib/supabase-service";
import { markSummariesStale, regenerateSummaryInBackground } from "@/lib/ai-helpers";
import { classifyPost } from "@/lib/ai-classify";

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Read-only in some contexts
          }
        },
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "Admin" && profile.role !== "Attendee")) {
    return NextResponse.json(
      { error: "You do not have permission to create posts" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { session_id, title: rawTitle, body: postBody } = body;

  if (!session_id || !postBody) {
    return NextResponse.json(
      { error: "Session and body are required" },
      { status: 400 }
    );
  }

  // Auto-generate title if not provided
  const title = rawTitle?.trim()
    || (postBody.replace(/[#*_`>\-\[\]()]/g, "").trim().slice(0, 60) + (postBody.length > 60 ? "..." : ""))
    || "Quick insight";

  // Auto-classify the post via AI
  let category = "Live Insight"; // fallback
  try {
    category = await classifyPost(title, postBody);
  } catch {
    // Non-critical — use fallback
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      session_id,
      title,
      body: postBody,
      category,
      author_id: user.id,
    })
    .select("*, profiles(username, role)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Best-effort: mark AI summaries stale and trigger background regeneration
  try {
    const { data: sess } = await getServiceClient()
      .from("sessions")
      .select("day_number")
      .eq("id", session_id)
      .single();
    if (sess) {
      await markSummariesStale(getServiceClient(), session_id, sess.day_number);
      regenerateSummaryInBackground(session_id);
    }
  } catch {
    // Non-critical — don't block post creation
  }

  return NextResponse.json(data, { status: 201 });
}
