"use client";

import { useState, ReactNode } from "react";
import AISummaryCard from "@/components/AISummaryCard";
import AILoadingState from "@/components/AILoadingState";
import { useAuth } from "@/lib/auth-context";
import type { SummaryContent } from "@/lib/ai-types";

interface SessionTabsProps {
  sessionId: number;
  postsContent: ReactNode;
}

export default function SessionTabs({ sessionId, postsContent }: SessionTabsProps) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "ai">("posts");
  const [summary, setSummary] = useState<SummaryContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const isAdmin = profile?.role === "Admin";

  const loadSummary = async (forceRegenerate = false) => {
    if (forceRegenerate) setRegenerating(true);
    else setLoading(true);
    setError(null);
    try {
      if (forceRegenerate) {
        await fetch("/api/ai/session-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, regenerate: true }),
        });
      }
      const res = await fetch("/api/ai/session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setSummary(data.summary);
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  const handleTabSwitch = (tab: "posts" | "ai") => {
    setActiveTab(tab);
    if (tab === "ai" && !loaded && !loading) loadSummary();
  };

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-[rgba(255,255,255,0.06)] px-4">
        <button
          onClick={() => handleTabSwitch("posts")}
          className={`relative px-3 py-3 text-[13px] font-medium transition-all duration-200 ${
            activeTab === "posts"
              ? "text-white"
              : "text-txt-tertiary hover:text-txt-secondary"
          }`}
        >
          Posts
          {activeTab === "posts" && (
            <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-emerald-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => handleTabSwitch("ai")}
          className={`relative px-3 py-3 text-[13px] font-medium transition-all duration-200 ${
            activeTab === "ai"
              ? "text-violet-300"
              : "text-txt-tertiary hover:text-txt-secondary"
          }`}
        >
          <span className="flex items-center gap-1">
            <span className="text-[11px]">✦</span> AI Summary
          </span>
          {activeTab === "ai" && (
            <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
          )}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "posts" && postsContent}

      {activeTab === "ai" && (
        <div className="p-4">
          {loading && <AILoadingState />}
          {error && (
            <p className="text-sm text-txt-tertiary py-6">
              Couldn&apos;t generate summary &mdash;{" "}
              <button onClick={() => loadSummary()} className="underline hover:text-txt-secondary transition-colors duration-200">
                try again
              </button>
            </p>
          )}
          {summary && !loading && (
            <AISummaryCard
              summary={summary}
              showRegenerate={isAdmin}
              onRegenerate={() => loadSummary(true)}
              regenerating={regenerating}
            />
          )}
        </div>
      )}
    </div>
  );
}
