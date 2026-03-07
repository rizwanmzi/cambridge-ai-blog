"use client";

import { useState, ReactNode } from "react";
import AISummaryCard from "@/components/AISummaryCard";
import AILoadingState from "@/components/AILoadingState";
import PhotoGallery from "@/components/PhotoGallery";
import { useAuth } from "@/lib/auth-context";
import type { SummaryContent } from "@/lib/ai-types";

interface SessionTabsProps {
  sessionId: number;
  postsContent: ReactNode;
  photoCount: number;
}

export default function SessionTabs({ sessionId, postsContent, photoCount }: SessionTabsProps) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "ai" | "photos">("posts");
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

  const handleTabSwitch = (tab: "posts" | "ai" | "photos") => {
    setActiveTab(tab);
    if (tab === "ai" && !loaded && !loading) loadSummary();
  };

  return (
    <div>
      {/* Pill-shaped tab toggle */}
      <div className="p-3">
        <div className="inline-flex items-center bg-[rgba(255,255,255,0.04)] rounded-full p-1 gap-0.5">
          <button
            onClick={() => handleTabSwitch("posts")}
            className={`px-4 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200 ${
              activeTab === "posts"
                ? "bg-[rgba(255,255,255,0.1)] text-white shadow-sm"
                : "text-txt-tertiary hover:text-txt-secondary"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => handleTabSwitch("ai")}
            className={`px-4 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === "ai"
                ? "bg-violet-500/15 text-violet-300 shadow-sm shadow-violet-500/10"
                : "text-txt-tertiary hover:text-txt-secondary"
            }`}
          >
            <span className="text-[10px]">&#10022;</span> AI Summary
          </button>
          <button
            onClick={() => handleTabSwitch("photos")}
            className={`px-4 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === "photos"
                ? "bg-[rgba(255,255,255,0.1)] text-white shadow-sm"
                : "text-txt-tertiary hover:text-txt-secondary"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Photos
            {photoCount > 0 && (
              <span className="text-[10px] bg-[rgba(255,255,255,0.1)] text-txt-tertiary px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {photoCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "posts" && (
        <div className="animate-fade-up">
          {postsContent}
        </div>
      )}

      {activeTab === "ai" && (
        <div className="p-4 animate-fade-up">
          {loading && <AILoadingState />}
          {error && (
            <div className="text-center py-10">
              <p className="text-sm text-txt-tertiary">
                Couldn&apos;t generate summary &mdash;{" "}
                <button onClick={() => loadSummary()} className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors duration-200">
                  try again
                </button>
              </p>
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

      {activeTab === "photos" && (
        <div className="animate-fade-up">
          <PhotoGallery sessionId={sessionId} initialPhotoCount={photoCount} />
        </div>
      )}
    </div>
  );
}
