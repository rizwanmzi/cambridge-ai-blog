import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase-server";
import ActivityPulse from "@/components/ActivityPulse";
import DaySummaryAccordion from "@/components/DaySummaryAccordion";

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

const dayLabels: Record<number, string> = {
  0: "Day 0 — Sunday 1 March",
  1: "Day 1 — Monday 2 March",
  2: "Day 2 — Tuesday 3 March",
  3: "Day 3 — Wednesday 4 March",
  4: "Day 4 — Thursday 5 March",
  5: "Day 5 — Friday 6 March",
};

function formatTime(t: string) {
  return t.slice(0, 5);
}

export const revalidate = 0;

export default async function Home() {
  const supabase = createSupabaseServer();

  // Fetch sessions
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("*")
    .order("day_number")
    .order("start_time");

  // Fetch post counts per session
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
        <h1 className="text-2xl font-bold text-navy-900 mb-4">
          Cambridge AI Leadership Programme
        </h1>
        <p className="text-navy-500">
          Unable to load programme. Please check your Supabase configuration.
        </p>
      </div>
    );
  }

  // Group by day
  const days: Record<number, Session[]> = {};
  for (const s of sessions) {
    const session: Session = { ...s, post_count: countMap[s.id] || 0 };
    if (!days[session.day_number]) days[session.day_number] = [];
    days[session.day_number].push(session);
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-3">
          Programme Agenda
        </h1>
        <p className="text-navy-500 text-lg">
          Cambridge AI Leadership Programme — Live Learning Blog
        </p>
      </div>

      <div className="space-y-10">
        {Object.entries(days)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([day, daySessions]) => (
            <section key={day}>
              <h2 className="text-lg font-semibold text-navy-900 mb-4 pb-2 border-b border-navy-100">
                {dayLabels[Number(day)] || `Day ${day}`}
              </h2>
              <div className="space-y-3">
                {daySessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/session/${session.id}`}
                    className="block group"
                  >
                    <div
                      className={`border rounded-lg p-4 transition-all ${
                        session.is_social
                          ? "border-navy-100 bg-navy-50/50 hover:border-navy-200"
                          : "border-navy-100 hover:border-navy-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm text-navy-400 font-mono shrink-0">
                              {formatTime(session.start_time)}–
                              {formatTime(session.end_time)}
                            </span>
                            {session.post_count > 0 && (
                              <span className="flex items-center gap-1.5">
                                <span className="text-xs font-medium bg-navy-100 text-navy-600 px-2 py-0.5 rounded-full">
                                  {session.post_count}{" "}
                                  {session.post_count === 1 ? "post" : "posts"}
                                </span>
                                <ActivityPulse postCount={session.post_count} />
                              </span>
                            )}
                          </div>
                          <h3
                            className={`font-medium group-hover:text-navy-600 transition-colors ${
                              session.is_social
                                ? "text-navy-500 italic"
                                : "text-navy-900"
                            }`}
                          >
                            {session.title}
                          </h3>
                          {session.faculty && (
                            <p className="text-sm text-navy-400 mt-0.5">
                              {session.faculty}
                            </p>
                          )}
                          {session.location && (
                            <p className="text-xs text-navy-300 mt-0.5">
                              {session.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <DaySummaryAccordion dayNumber={Number(day)} />
            </section>
          ))}
      </div>
    </div>
  );
}
