/**
 * One-time script to bulk-generate AI summaries for all sessions with posts.
 * Run: npx tsx scripts/bulk-generate.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// We need to dynamically import the generate function since it uses the service client
async function main() {
  console.log("Fetching sessions...");

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, title")
    .order("id");

  if (!sessions || sessions.length === 0) {
    console.log("No sessions found.");
    return;
  }

  // Get post counts per session
  const { data: posts } = await supabase.from("posts").select("session_id");
  const sessionsWithPosts = new Set<number>();
  if (posts) {
    for (const p of posts) {
      sessionsWithPosts.add(p.session_id);
    }
  }

  console.log(`Found ${sessions.length} sessions, ${sessionsWithPosts.size} have posts.\n`);

  // Import the generator
  const { generateSessionSummary } = await import("../src/lib/ai-generate");

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const session of sessions) {
    if (!sessionsWithPosts.has(session.id)) {
      console.log(`  [SKIP] ${session.title} (no posts)`);
      skipped++;
      continue;
    }

    // Check if fresh cache exists
    const { data: cached } = await supabase
      .from("ai_summaries")
      .select("is_stale")
      .eq("scope", "session")
      .eq("session_id", session.id)
      .single();

    if (cached && !cached.is_stale) {
      console.log(`  [CACHED] ${session.title}`);
      skipped++;
      continue;
    }

    try {
      console.log(`  [GENERATING] ${session.title}...`);
      await generateSessionSummary(session.id);
      console.log(`  [DONE] ${session.title}`);
      generated++;
    } catch (err) {
      console.error(`  [ERROR] ${session.title}:`, err);
      errors++;
    }
  }

  console.log(`\nComplete: ${generated} generated, ${skipped} skipped, ${errors} errors.`);
}

main().catch(console.error);
