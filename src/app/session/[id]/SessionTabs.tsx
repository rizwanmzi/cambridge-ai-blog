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
      <div className="flex border-b border-dark-border mb-4">
        <button
          onClick={() => handleTabSwitch("posts")}
          className={`px-3 py-2.5 text-[13px] border-b-2 transition-colors ${
            activeTab === "posts"
              ? "border-white text-white"
              : "border-transparent text-txt-tertiary hover:text-txt-secondary"
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => handleTabSwitch("ai")}
          className={`px-3 py-2.5 text-[13px] border-b-2 transition-colors ${
            activeTab === "ai"
              ? "border-white text-white"
              : "border-transparent text-txt-tertiary hover:text-txt-secondary"
          }`}
        >
          AI Summary
        </button>
      </div>

      {activeTab === "posts" && postsContent}

      {activeTab === "ai" && (
        <div>
          {loading && <AILoadingState />}
          {error && (
            <p className="text-sm text-txt-tertiary py-6">
              Couldn&apos;t generate summary — <button onClick={() => loadSummary()} className="underline hover:text-txt-secondary">try again</button>
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
