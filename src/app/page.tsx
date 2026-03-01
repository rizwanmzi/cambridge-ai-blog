import { createSupabaseServer } from "@/lib/supabase-server";
import LandingPage from "@/components/LandingPage";
import ProgrammeTimeline from "@/components/ProgrammeTimeline";

interface Session {
  id: number;
  day_number: number;
  title: string;
  faculty: string | null;
  start_time: string;
  end_time: string;
  session_date: string;
  location: string | null;
  is_social: boolean;
  post_count: number;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const supabase = createSupabaseServer();

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in → show landing page
  if (!user) {
    return <LandingPage />;
  }

  // Logged in → show programme agenda
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
      <div className="text-center py-16">
        <h1 className="font-heading text-2xl font-bold text-txt-primary mb-4">
          Cambridge AI Leadership Programme
        </h1>
        <p className="text-txt-secondary">
          Unable to load programme. Please check your Supabase configuration.
        </p>
      </div>
    );
  }

  const allSessions: Session[] = sessions.map((s) => ({
    ...s,
    post_count: countMap[s.id] || 0,
  }));

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-txt-primary mb-3">
          Programme Agenda
        </h1>
        <p className="text-txt-secondary text-lg">
          Cambridge AI Leadership Programme — Live Learning Blog
        </p>
      </div>

      <ProgrammeTimeline sessions={allSessions} />
    </div>
  );
}
