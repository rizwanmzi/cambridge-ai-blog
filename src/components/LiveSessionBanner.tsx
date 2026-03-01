"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ActivityPulse from "./ActivityPulse";

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

function formatTime(t: string) {
  return t.slice(0, 5);
}

function getSessionDatetime(sessionDate: string, time: string): Date {
  // sessionDate is "YYYY-MM-DD", time is "HH:MM:SS"
  const dateStr = `${sessionDate}T${time}`;
  // Parse as UTC then treat as London time
  return new Date(dateStr + "+00:00"); // sessions are stored in UK time
}

function getNowInLondon(): Date {
  // Get current time as a London timestamp
  const now = new Date();
  const londonStr = now.toLocaleString("en-GB", { timeZone: "Europe/London" });
  // Parse "DD/MM/YYYY, HH:MM:SS" format
  const [datePart, timePart] = londonStr.split(", ");
  const [day, month, year] = datePart.split("/");
  const isoStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${timePart}+00:00`;
  return new Date(isoStr);
}

export type SessionStatus = "live" | "up-next" | "completed" | "upcoming";

export function getSessionStatus(
  session: Session,
  allSessions: Session[],
  now: Date
): SessionStatus {
  const start = getSessionDatetime(session.session_date, session.start_time);
  const end = getSessionDatetime(session.session_date, session.end_time);

  if (now >= start && now <= end) return "live";
  if (now > end) return "completed";

  // Check if this is the next upcoming session
  const futureSessions = allSessions
    .filter((s) => {
      const sStart = getSessionDatetime(s.session_date, s.start_time);
      return sStart > now;
    })
    .sort((a, b) => {
      const aStart = getSessionDatetime(a.session_date, a.start_time);
      const bStart = getSessionDatetime(b.session_date, b.start_time);
      return aStart.getTime() - bStart.getTime();
    });

  if (futureSessions.length > 0 && futureSessions[0].id === session.id) {
    return "up-next";
  }

  return "upcoming";
}

export default function LiveSessionBanner({
  sessions,
}: {
  sessions: Session[];
}) {
  const [now, setNow] = useState<Date>(getNowInLondon());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(getNowInLondon());
    }, 30000); // update every 30s
    return () => clearInterval(interval);
  }, []);

  const liveSession = sessions.find(
    (s) => getSessionStatus(s, sessions, now) === "live"
  );
  const upNextSession = sessions.find(
    (s) => getSessionStatus(s, sessions, now) === "up-next"
  );

  // Programme date range
  const programmeStart = getSessionDatetime("2025-03-01", "17:00:00");
  const lastSession = sessions[sessions.length - 1];
  const programmeEnd = lastSession
    ? getSessionDatetime(lastSession.session_date, lastSession.end_time)
    : programmeStart;

  if (now < programmeStart) {
    return (
      <div className="mb-8 p-5 rounded-xl border border-dark-border bg-dark-surface">
        <p className="text-txt-secondary text-center">
          Programme begins Sunday 1 March at 5pm
        </p>
      </div>
    );
  }

  if (now > programmeEnd && !liveSession) {
    return (
      <div className="mb-8 p-5 rounded-xl border border-dark-border bg-dark-surface">
        <p className="text-txt-secondary text-center">Programme complete</p>
      </div>
    );
  }

  if (!liveSession && !upNextSession) return null;

  return (
    <div className="mb-8 space-y-3">
      {liveSession && (
        <Link href={`/session/${liveSession.id}`} className="block group">
          <div className="rounded-xl p-5 border-2 border-red-500/50 bg-dark-surface hover:border-red-500/70 transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)]">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  Live Now
                </span>
              </span>
              <span className="text-sm text-txt-secondary font-mono">
                {formatTime(liveSession.start_time)}–{formatTime(liveSession.end_time)}
              </span>
              {liveSession.post_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="text-xs font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                    {liveSession.post_count} {liveSession.post_count === 1 ? "post" : "posts"}
                  </span>
                  <ActivityPulse postCount={liveSession.post_count} />
                </span>
              )}
            </div>
            <h3 className="text-lg font-medium text-txt-primary group-hover:text-red-400 transition-colors">
              {liveSession.title}
            </h3>
            {liveSession.faculty && (
              <p className="text-sm text-txt-secondary mt-0.5">{liveSession.faculty}</p>
            )}
          </div>
        </Link>
      )}

      {upNextSession && (
        <Link href={`/session/${upNextSession.id}`} className="block group">
          <div className="rounded-xl p-5 border border-accent/40 bg-dark-surface hover:border-accent/60 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">
                Up Next
              </span>
              <span className="text-sm text-txt-secondary font-mono">
                {formatTime(upNextSession.start_time)}–{formatTime(upNextSession.end_time)}
              </span>
            </div>
            <h3 className="text-lg font-medium text-txt-primary group-hover:text-accent transition-colors">
              {upNextSession.title}
            </h3>
            {upNextSession.faculty && (
              <p className="text-sm text-txt-secondary mt-0.5">{upNextSession.faculty}</p>
            )}
          </div>
        </Link>
      )}
    </div>
  );
}
