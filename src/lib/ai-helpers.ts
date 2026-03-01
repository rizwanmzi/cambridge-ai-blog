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
