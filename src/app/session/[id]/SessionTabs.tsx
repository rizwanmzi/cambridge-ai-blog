"use client";

import { useState, ReactNode } from "react";
import SparkleIcon from "@/components/SparkleIcon";
import AISummaryCard from "@/components/AISummaryCard";
import AILoadingState from "@/components/AILoadingState";
import { useAuth } from "@/lib/auth-context";
import type { SummaryContent } from "@/lib/anthropic";

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
    if (forceRegenerate) {
      setRegenerating(true);
    } else {
      setLoading(true);
    }
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
    if (tab === "ai" && !loaded && !loading) {
      loadSummary();
    }
  };

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex border-b border-[rgba(255,255,255,0.06)] mb-6">
        <button
          onClick={() => handleTabSwitch("posts")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "posts"
              ? "border-txt-primary text-txt-primary"
              : "border-transparent text-txt-secondary hover:text-txt-primary"
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => handleTabSwitch("ai")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "ai"
              ? "border-accent text-accent"
              : "border-transparent text-txt-secondary hover:text-accent"
          }`}
        >
          <SparkleIcon className="w-3.5 h-3.5" />
          AI Summary
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "posts" && postsContent}

      {activeTab === "ai" && (
        <div>
          {loading && <AILoadingState />}
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
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
