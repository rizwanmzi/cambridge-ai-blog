"use client";

import Link from "next/link";
import ActivityPulse from "./ActivityPulse";
import { SessionStatus } from "./LiveSessionBanner";

interface Session {
  id: number;
  title: string;
  faculty: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  is_social: boolean;
  post_count: number;
}

function formatTime(t: string) {
  return t.slice(0, 5);
}

export default function SessionCard({
  session,
  status,
}: {
  session: Session;
  status: SessionStatus;
}) {
  const isCompleted = status === "completed";
  const isLive = status === "live";

  return (
    <Link href={`/session/${session.id}`} className="block group scroll-fade-in">
      <div
        className={`rounded-xl p-4 transition-all duration-150 ${
          session.is_social
            ? "border border-dashed border-[rgba(255,255,255,0.06)] bg-dark-surface/50 hover:border-[rgba(255,255,255,0.12)]"
            : isLive
            ? "border-2 border-red-500/50 bg-dark-surface hover:border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
            : isCompleted
            ? "border border-[rgba(255,255,255,0.06)] bg-dark-surface/60 opacity-70 hover:opacity-100 hover:border-[rgba(255,255,255,0.12)]"
            : "border border-[rgba(255,255,255,0.06)] bg-dark-surface card-hover"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm text-txt-secondary font-mono shrink-0">
                {formatTime(session.start_time)}–{formatTime(session.end_time)}
              </span>
              {isLive && (
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live</span>
                </span>
              )}
              {session.post_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="text-xs font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                    {session.post_count} {session.post_count === 1 ? "post" : "posts"}
                  </span>
                  <ActivityPulse postCount={session.post_count} />
                </span>
              )}
            </div>
            <h3
              className={`font-medium transition-colors ${
                session.is_social
                  ? "text-txt-secondary italic"
                  : isLive
                  ? "text-txt-primary group-hover:text-red-400"
                  : "text-txt-primary group-hover:text-accent"
              }`}
            >
              {session.title}
            </h3>
            {session.faculty && (
              <p className="text-sm text-txt-secondary mt-0.5">{session.faculty}</p>
            )}
            {session.location && (
              <p className="text-xs text-txt-secondary/60 mt-0.5">{session.location}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
