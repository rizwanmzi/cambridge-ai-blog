"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  0: "DAY 0 — SUNDAY 1 MARCH",
  1: "DAY 1 — MONDAY 2 MARCH",
  2: "DAY 2 — TUESDAY 3 MARCH",
  3: "DAY 3 — WEDNESDAY 4 MARCH",
  4: "DAY 4 — THURSDAY 5 MARCH",
  5: "DAY 5 — FRIDAY 6 MARCH",
};

type SessionStatus = "live" | "up-next" | "completed" | "upcoming";

function getSessionDatetime(sessionDate: string, time: string): Date {
  return new Date(`${sessionDate}T${time}+00:00`);
}

function getNowInLondon(): Date {
  const now = new Date();
  const londonStr = now.toLocaleString("en-GB", { timeZone: "Europe/London" });
  const [datePart, timePart] = londonStr.split(", ");
  const [day, month, year] = datePart.split("/");
  return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${timePart}+00:00`);
}

function getSessionStatus(session: Session, allSessions: Session[], now: Date): SessionStatus {
  const start = getSessionDatetime(session.session_date, session.start_time);
  const end = getSessionDatetime(session.session_date, session.end_time);
  if (now >= start && now <= end) return "live";
  if (now > end) return "completed";
  const future = allSessions
    .filter((s) => getSessionDatetime(s.session_date, s.start_time) > now)
    .sort((a, b) => getSessionDatetime(a.session_date, a.start_time).getTime() - getSessionDatetime(b.session_date, b.start_time).getTime());
  if (future.length > 0 && future[0].id === session.id) return "up-next";
  return "upcoming";
}

function formatTime(t: string) {
  return t.slice(0, 5);
}

export default function ProgrammeTimeline({ sessions }: { sessions: Session[] }) {
  const [now, setNow] = useState<Date>(getNowInLondon());

  useEffect(() => {
    const interval = setInterval(() => setNow(getNowInLondon()), 30000);
    return () => clearInterval(interval);
  }, []);

  const days: Record<number, Session[]> = {};
  for (const s of sessions) {
    if (!days[s.day_number]) days[s.day_number] = [];
    days[s.day_number].push(s);
  }

  return (
    <div>
      {Object.entries(days)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([day, daySessions]) => (
          <section key={day}>
            <h2 className="text-[12px] uppercase tracking-wider text-[rgba(255,255,255,0.4)] mt-8 mb-3 first:mt-0">
              {dayLabels[Number(day)] || `DAY ${day}`}
            </h2>
            <div>
              {daySessions.map((session) => {
                const status = getSessionStatus(session, sessions, now);
                const isLive = status === "live";
                const isUpNext = status === "up-next";
                return (
                  <Link
                    key={session.id}
                    href={`/session/${session.id}`}
                    className="flex items-center gap-4 py-2.5 border-b border-dark-border hover:bg-dark-hover transition-colors group"
                  >
                    {/* Time */}
                    <span className="font-mono text-[13px] text-txt-tertiary shrink-0 w-[100px] hidden sm:block">
                      {formatTime(session.start_time)}–{formatTime(session.end_time)}
                    </span>
                    <span className="font-mono text-[12px] text-txt-tertiary shrink-0 sm:hidden">
                      {formatTime(session.start_time)}
                    </span>

                    {/* Activity dot + Live dot */}
                    <span className="shrink-0 w-[6px]">
                      {isLive ? (
                        <span className="block w-1.5 h-1.5 rounded-full bg-green-400 live-dot" />
                      ) : session.post_count >= 3 ? (
                        <span className="block w-1.5 h-1.5 rounded-full bg-green-400" />
                      ) : session.post_count >= 1 ? (
                        <span className="block w-1.5 h-1.5 rounded-full bg-amber-400" />
                      ) : null}
                    </span>

                    {/* Title */}
                    <span className={`text-sm flex-1 min-w-0 truncate ${
                      session.is_social
                        ? "italic text-[rgba(255,255,255,0.4)]"
                        : "text-[rgba(255,255,255,0.85)] group-hover:text-white"
                    }`}>
                      {session.title}
                      {isUpNext && (
                        <span className="text-[12px] text-txt-tertiary ml-2 font-normal not-italic">Up Next</span>
                      )}
                    </span>

                    {/* Mobile: line 2 info hidden, faculty on desktop */}
                    {session.faculty && (
                      <span className="text-[13px] text-txt-tertiary shrink-0 hidden sm:block truncate max-w-[200px]">
                        {session.faculty}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
    </div>
  );
}
