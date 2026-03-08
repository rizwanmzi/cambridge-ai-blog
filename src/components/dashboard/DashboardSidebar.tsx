"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import RoleBadge from "@/components/RoleBadge";
import GuideModal from "@/components/GuideModal";
import type { SessionListItem } from "@/lib/dashboard-types";

interface DashboardSidebarProps {
  sessions: SessionListItem[];
  selectedSessionId: number | null;
  onSelectSession: (id: number) => void;
  onOpenAsk: () => void;
  collapsed: boolean;
}

const DAY_LABELS: Record<number, string> = {
  0: "Pre-Arrival",
  1: "Day 1",
  2: "Day 2",
  3: "Day 3",
  4: "Day 4",
  5: "Day 5",
};

function formatTime(time: string): string {
  // time is "HH:MM:SS" or "HH:MM" — return "HH:MM"
  return time.slice(0, 5);
}

export default function DashboardSidebar({
  sessions,
  selectedSessionId,
  onSelectSession,
  onOpenAsk,
  collapsed,
}: DashboardSidebarProps) {
  const { profile, signOut } = useAuth();
  const [guideOpen, setGuideOpen] = useState(false);

  // All day groups start expanded
  const [collapsedDays, setCollapsedDays] = useState<Record<number, boolean>>(
    {}
  );

  // Group sessions by day_number
  const dayGroups: Record<number, SessionListItem[]> = {};
  for (const s of sessions) {
    if (!dayGroups[s.day_number]) {
      dayGroups[s.day_number] = [];
    }
    dayGroups[s.day_number].push(s);
  }

  const sortedDays = Object.keys(dayGroups)
    .map(Number)
    .sort((a, b) => a - b);

  function toggleDay(day: number) {
    setCollapsedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  }

  return (
    <>
      <aside
        className={`${
          collapsed ? "w-[60px]" : "w-60"
        } bg-[#111111] border-r border-[rgba(255,255,255,0.06)] h-screen sticky top-0 overflow-y-auto dashboard-sidebar flex flex-col shrink-0 transition-[width] duration-200`}
      >
        {/* Logo / Brand */}
        <div className="px-4 py-4 shrink-0">
          <Link
            href="/"
            className="text-white font-semibold text-[15px] hover:text-txt-secondary transition-colors"
          >
            {collapsed ? "CA" : "Cambridge AI"}
          </Link>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {sortedDays.map((day) => (
            <div key={day}>
              {/* Day group header */}
              <button
                onClick={() => toggleDay(day)}
                className="day-group-toggle w-full flex items-center justify-between px-4 py-2 text-[11px] font-medium text-txt-tertiary uppercase tracking-wider"
              >
                {!collapsed && (
                  <span>{DAY_LABELS[day] ?? `Day ${day}`}</span>
                )}
                <svg
                  className={`w-3 h-3 transition-transform duration-150 ${
                    collapsedDays[day] ? "-rotate-90" : ""
                  } ${collapsed ? "mx-auto" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Session items */}
              {!collapsedDays[day] &&
                dayGroups[day].map((session) => {
                  const isActive = session.id === selectedSessionId;
                  return (
                    <button
                      key={session.id}
                      onClick={() => onSelectSession(session.id)}
                      className={`session-item ${
                        isActive ? "active" : ""
                      } w-full text-left px-4 py-2 flex items-center gap-2`}
                      title={session.title}
                    >
                      {!collapsed ? (
                        <>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-[13px] truncate ${
                                session.is_social
                                  ? "italic text-txt-secondary"
                                  : "text-txt-primary"
                              }`}
                            >
                              {session.title}
                            </p>
                            <p className="text-[11px] text-txt-tertiary">
                              {formatTime(session.start_time)}
                            </p>
                          </div>
                          {session.post_count > 0 && (
                            <span className="text-[10px] font-medium bg-emerald-500/15 text-emerald-400 rounded-full px-1.5 py-0.5 leading-none shrink-0">
                              {session.post_count}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[11px] text-txt-secondary mx-auto">
                          {formatTime(session.start_time).slice(0, 2)}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-[rgba(255,255,255,0.06)] mx-3" />

        {/* Nav links */}
        <nav className="px-2 py-2 space-y-0.5 shrink-0">
          {/* Ask AI */}
          <button
            onClick={onOpenAsk}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-[13px] text-txt-secondary hover:text-txt-primary hover:bg-[rgba(255,255,255,0.04)] transition-colors"
          >
            {/* Sparkle icon */}
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
            {!collapsed && <span>Ask AI</span>}
          </button>

          {/* Resources */}
          <Link
            href="/resources"
            className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-[13px] text-txt-secondary hover:text-txt-primary hover:bg-[rgba(255,255,255,0.04)] transition-colors"
          >
            {/* Folder icon */}
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
              />
            </svg>
            {!collapsed && <span>Resources</span>}
          </Link>

          {/* Guide */}
          <button
            onClick={() => setGuideOpen(true)}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-[13px] text-txt-secondary hover:text-txt-primary hover:bg-[rgba(255,255,255,0.04)] transition-colors"
          >
            {/* Question mark circle icon */}
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
            {!collapsed && <span>Guide</span>}
          </button>

          {/* About */}
          <Link
            href="/about"
            className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-[13px] text-txt-secondary hover:text-txt-primary hover:bg-[rgba(255,255,255,0.04)] transition-colors"
          >
            {/* Info circle icon */}
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            {!collapsed && <span>About</span>}
          </Link>
        </nav>

        {/* Divider */}
        <div className="border-t border-[rgba(255,255,255,0.06)] mx-3" />

        {/* User section */}
        <div className="px-3 py-3 shrink-0">
          {profile ? (
            <div className="flex items-center gap-2">
              {!collapsed ? (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-txt-primary truncate">
                      {profile.username}
                    </p>
                    <RoleBadge role={profile.role} />
                  </div>
                  <button
                    onClick={signOut}
                    className="text-txt-tertiary hover:text-txt-secondary transition-colors shrink-0"
                    title="Log out"
                  >
                    {/* Logout icon */}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <button
                  onClick={signOut}
                  className="text-txt-tertiary hover:text-txt-secondary transition-colors mx-auto block"
                  title="Log out"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                    />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div className="h-8" />
          )}
        </div>
      </aside>

      {/* Guide Modal */}
      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
}
