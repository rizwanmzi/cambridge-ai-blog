import { SupabaseClient } from "@supabase/supabase-js";

export async function markSummariesStale(
  supabase: SupabaseClient,
  sessionId: number,
  dayNumber: number
) {
  // Mark session summary stale
  await supabase
    .from("ai_summaries")
    .update({ is_stale: true })
    .eq("scope", "session")
    .eq("session_id", sessionId);

  // Mark day summary stale
  await supabase
    .from("ai_summaries")
    .update({ is_stale: true })
    .eq("scope", "day")
    .eq("day_number", dayNumber);

  // Mark programme summary stale
  await supabase
    .from("ai_summaries")
    .update({ is_stale: true })
    .eq("scope", "programme");
}

/**
 * Fire-and-forget: regenerate a session summary in the background.
 * Uses dynamic import to avoid circular dependencies.
 * Errors are caught silently — this is best-effort.
 */
export function regenerateSummaryInBackground(sessionId: number) {
  import("./ai-generate").then(({ generateSessionSummary }) => {
    generateSessionSummary(sessionId).catch((err) => {
      console.error(`Background summary regeneration failed for session ${sessionId}:`, err);
    });
  });
}
