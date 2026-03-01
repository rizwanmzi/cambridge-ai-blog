"use client";

import { useEffect, useState } from "react";
import LiveSessionBanner from "./LiveSessionBanner";
import SessionCard from "./SessionCard";
import DaySummaryAccordion from "./DaySummaryAccordion";
import { getSessionStatus } from "./LiveSessionBanner";

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
  0: "Day 0 \u2014 Sunday 1 March",
  1: "Day 1 \u2014 Monday 2 March",
  2: "Day 2 \u2014 Tuesday 3 March",
  3: "Day 3 \u2014 Wednesday 4 March",
  4: "Day 4 \u2014 Thursday 5 March",
  5: "Day 5 \u2014 Friday 6 March",
};

function getNowInLondon(): Date {
  const now = new Date();
  const londonStr = now.toLocaleString("en-GB", { timeZone: "Europe/London" });
  const [datePart, timePart] = londonStr.split(", ");
  const [day, month, year] = datePart.split("/");
  const isoStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${timePart}+00:00`;
  return new Date(isoStr);
}

export default function ProgrammeTimeline({
  sessions,
}: {
  sessions: Session[];
}) {
  const [now, setNow] = useState<Date>(getNowInLondon());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(getNowInLondon());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Group by day
  const days: Record<number, Session[]> = {};
  for (const s of sessions) {
    if (!days[s.day_number]) days[s.day_number] = [];
    days[s.day_number].push(s);
  }

  return (
    <>
      <LiveSessionBanner sessions={sessions} />

      <div className="space-y-10">
        {Object.entries(days)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([day, daySessions]) => (
            <section key={day} className="scroll-fade-in">
              <h2 className="font-heading text-lg font-semibold text-txt-primary mb-4 pb-2 border-b border-dark-border sticky top-[65px] bg-dark-bg/95 backdrop-blur z-20 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6">
                {dayLabels[Number(day)] || `Day ${day}`}
              </h2>
              <div className="space-y-4">
                {daySessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    status={getSessionStatus(session, sessions, now)}
                  />
                ))}
              </div>
              <DaySummaryAccordion dayNumber={Number(day)} />
            </section>
          ))}
      </div>
    </>
  );
}
