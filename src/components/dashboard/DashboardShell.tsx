"use client";

import { useState, useEffect } from "react";
import type { SessionListItem } from "@/lib/dashboard-types";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import CenterPanel from "@/components/dashboard/CenterPanel";
import RightPanel from "@/components/dashboard/RightPanel";
import AskDrawer from "@/components/dashboard/AskDrawer";

/* ------------------------------------------------------------------ */
/*  MobileSessionList — full-width session list for mobile view        */
/* ------------------------------------------------------------------ */

const DAY_LABELS: Record<number, string> = {
  0: "Pre-Arrival",
  1: "Day 1",
  2: "Day 2",
  3: "Day 3",
  4: "Day 4",
  5: "Day 5",
};

function formatTime(time: string): string {
  return time.slice(0, 5);
}

function MobileSessionList({
  sessions,
  selectedSessionId,
  onSelect,
}: {
  sessions: SessionListItem[];
  selectedSessionId: number | null;
  onSelect: (id: number) => void;
}) {
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

  return (
    <div className="py-2">
      {sortedDays.map((day) => (
        <div key={day}>
          {/* Day header */}
          <div className="px-4 py-2 text-[11px] font-medium text-[rgba(255,255,255,0.35)] uppercase tracking-wider">
            {DAY_LABELS[day] ?? `Day ${day}`}
          </div>

          {/* Sessions */}
          {dayGroups[day].map((session) => {
            const isActive = session.id === selectedSessionId;
            return (
              <button
                key={session.id}
                onClick={() => onSelect(session.id)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                  isActive
                    ? "bg-[rgba(255,255,255,0.06)]"
                    : "hover:bg-[rgba(255,255,255,0.03)]"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[14px] truncate ${
                      session.is_social
                        ? "italic text-[rgba(255,255,255,0.5)]"
                        : "text-white"
                    }`}
                  >
                    {session.title}
                  </p>
                  <p className="text-[12px] text-[rgba(255,255,255,0.35)] mt-0.5">
                    {formatTime(session.start_time)} &ndash;{" "}
                    {formatTime(session.end_time)}
                    {session.faculty && (
                      <span className="ml-2 text-[rgba(255,255,255,0.25)]">
                        &middot; {session.faculty}
                      </span>
                    )}
                  </p>
                </div>
                {session.post_count > 0 && (
                  <span className="text-[11px] font-medium bg-emerald-500/15 text-emerald-400 rounded-full px-2 py-0.5 leading-none shrink-0">
                    {session.post_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  DashboardShell                                                     */
/* ================================================================== */

interface DashboardShellProps {
  sessions: SessionListItem[];
}

export default function DashboardShell({ sessions }: DashboardShellProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [askDrawerOpen, setAskDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileTab, setMobileTab] = useState<
    "sessions" | "summary" | "posts" | "chat"
  >("sessions");

  /* ---------------------------------------------------------------- */
  /*  URL sync — read params on mount                                  */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get("session");
    const postParam = params.get("post");
    const askParam = params.get("ask");

    if (sessionParam) {
      setSelectedSessionId(Number(sessionParam));
      setMobileTab("summary");
    }
    if (postParam) {
      setExpandedPostId(Number(postParam));
      setMobileTab("posts");
    }
    if (askParam === "1") setAskDrawerOpen(true);
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Responsive sidebar collapse via media query                      */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) =>
      setSidebarCollapsed(!e.matches);
    setSidebarCollapsed(!mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Handlers                                                         */
  /* ---------------------------------------------------------------- */
  function handleSelectSession(id: number) {
    setSelectedSessionId(id);
    setExpandedPostId(null);
    setMobileTab("summary");
    window.history.replaceState(null, "", `/?session=${id}`);
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <>
      {/* ── Desktop / Tablet layout (>= 768px) ───────────────────── */}
      <div className="hidden md:flex h-screen overflow-hidden bg-[#0A0A0A]">
        {/* Sidebar */}
        <DashboardSidebar
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          onSelectSession={handleSelectSession}
          onOpenAsk={() => setAskDrawerOpen(true)}
          collapsed={sidebarCollapsed}
        />

        {/* Center panel */}
        <div className="flex-1 overflow-y-auto">
          <CenterPanel
            selectedSessionId={selectedSessionId}
            expandedPostId={expandedPostId}
            onExpandPost={setExpandedPostId}
          />
        </div>

        {/* Right panel — visible only on lg+ */}
        <div className="w-80 border-l border-[rgba(255,255,255,0.06)] overflow-y-auto hidden lg:block">
          <RightPanel selectedSessionId={selectedSessionId} />
        </div>

        {/* Ask drawer */}
        <AskDrawer
          open={askDrawerOpen}
          onClose={() => setAskDrawerOpen(false)}
        />
      </div>

      {/* ── Mobile layout (< 768px) ──────────────────────────────── */}
      <div className="md:hidden flex flex-col h-screen bg-[#0A0A0A]">
        {/* Mobile header */}
        <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold text-white">
            Cambridge AI
          </span>
          <button
            onClick={() => setAskDrawerOpen(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all duration-200"
          >
            {/* Sparkle icon */}
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
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
          </button>
        </div>

        {/* Mobile content */}
        <div className="flex-1 overflow-y-auto">
          {mobileTab === "sessions" && (
            <MobileSessionList
              sessions={sessions}
              selectedSessionId={selectedSessionId}
              onSelect={handleSelectSession}
            />
          )}
          {mobileTab === "summary" && (
            <CenterPanel
              selectedSessionId={selectedSessionId}
              expandedPostId={null}
              onExpandPost={() => {}}
            />
          )}
          {mobileTab === "posts" && (
            <CenterPanel
              selectedSessionId={selectedSessionId}
              expandedPostId={expandedPostId}
              onExpandPost={setExpandedPostId}
            />
          )}
          {mobileTab === "chat" && (
            <RightPanel selectedSessionId={selectedSessionId} />
          )}
        </div>

        {/* Bottom tab bar */}
        <div className="border-t border-[rgba(255,255,255,0.06)] pb-[env(safe-area-inset-bottom)] shrink-0">
          <div className="flex items-center justify-around h-14">
            {/* Sessions tab */}
            <button
              onClick={() => setMobileTab("sessions")}
              className={`flex flex-col items-center gap-0.5 ${
                mobileTab === "sessions"
                  ? "text-white"
                  : "text-[rgba(255,255,255,0.45)]"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                />
              </svg>
              <span className="text-[11px]">Sessions</span>
            </button>

            {/* Summary tab */}
            <button
              onClick={() => setMobileTab("summary")}
              className={`flex flex-col items-center gap-0.5 ${
                mobileTab === "summary"
                  ? "text-white"
                  : "text-[rgba(255,255,255,0.45)]"
              }`}
            >
              <span className="text-lg leading-5">&#10022;</span>
              <span className="text-[11px]">Summary</span>
            </button>

            {/* Posts tab */}
            <button
              onClick={() => setMobileTab("posts")}
              className={`flex flex-col items-center gap-0.5 ${
                mobileTab === "posts"
                  ? "text-white"
                  : "text-[rgba(255,255,255,0.45)]"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
              <span className="text-[11px]">Posts</span>
            </button>

            {/* Chat tab */}
            <button
              onClick={() => setMobileTab("chat")}
              className={`flex flex-col items-center gap-0.5 ${
                mobileTab === "chat"
                  ? "text-white"
                  : "text-[rgba(255,255,255,0.45)]"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 20.25V4.5a2.25 2.25 0 012.25-2.25h12A2.25 2.25 0 0120.25 4.5v9a2.25 2.25 0 01-2.25 2.25H7.961a1.5 1.5 0 00-1.06.44l-2.122 2.121a.75.75 0 01-1.028-.028z"
                />
              </svg>
              <span className="text-[11px]">Chat</span>
            </button>
          </div>
        </div>

        {/* Ask drawer (mobile) */}
        <AskDrawer
          open={askDrawerOpen}
          onClose={() => setAskDrawerOpen(false)}
        />
      </div>
    </>
  );
}
