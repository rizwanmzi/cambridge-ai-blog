import { createSupabaseServer } from "@/lib/supabase-server";
import LandingPage from "@/components/LandingPage";
import ProgrammeTimeline from "@/components/ProgrammeTimeline";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("*")
    .order("day_number")
    .order("start_time");

  const { data: postCounts } = await supabase
    .from("posts")
    .select("session_id");

  const countMap: Record<number, number> = {};
  if (postCounts) {
    for (const p of postCounts) {
      countMap[p.session_id] = (countMap[p.session_id] || 0) + 1;
    }
  }

  if (error || !sessions) {
    return (
      <div className="max-w-[720px] mx-auto text-center py-16">
        <p className="text-txt-secondary text-sm">
          Unable to load programme. Please check your configuration.
        </p>
      </div>
    );
  }

  const allSessions = sessions.map((s) => ({
    ...s,
    post_count: countMap[s.id] || 0,
  }));

  return (
    <div className="max-w-[720px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Programme Agenda</h1>
        <p className="text-[13px] text-txt-secondary mt-1">
          Cohort 2 — Live Learning AI Blog
        </p>
      </div>
      <ProgrammeTimeline sessions={allSessions} />
    </div>
  );
}
