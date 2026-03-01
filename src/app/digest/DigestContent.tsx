"use client";

import { useState, useEffect } from "react";
import SparkleIcon from "@/components/SparkleIcon";
import AISummaryCard from "@/components/AISummaryCard";
import AILoadingState from "@/components/AILoadingState";
import RoleBadge from "@/components/RoleBadge";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import type { SummaryContent } from "@/lib/anthropic";

interface Leaderboard {
  topContributors: { username: string; role: string; count: number }[];
  mostDiscussedPost: { id: number; title: string; comment_count: number } | null;
  questionOfTheWeek: string | null;
}

export default function DigestContent() {
  const { profile } = useAuth();
  const [summary, setSummary] = useState<SummaryContent | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const isAdmin = profile?.role === "Admin";

  const loadDigest = async (regen = false) => {
    if (regen) setRegenerating(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/programme-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setSummary(data.summary);
      setLeaderboard(data.leaderboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    loadDigest();
  }, []);

  if (loading) return <AILoadingState />;

  if (error) {
    return (
      <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {summary && (
        <AISummaryCard
          summary={summary}
          showRegenerate={isAdmin}
          onRegenerate={() => loadDigest(true)}
          regenerating={regenerating}
        />
      )}

      {/* Leaderboard */}
      {leaderboard && (
        <div className="bg-dark-surface rounded-xl border border-dark-border overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-border">
            <h2 className="text-lg font-heading font-semibold text-txt-primary flex items-center gap-2">
              <SparkleIcon className="w-4 h-4 text-accent" />
              Programme Leaderboard
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Top Contributors */}
            {leaderboard.topContributors.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-txt-primary mb-3">Top 5 Contributors</h3>
                <div className="space-y-2">
                  {leaderboard.topContributors.map((c, i) => (
                    <div key={c.username} className="flex items-center gap-3">
                      <span className="text-lg font-bold text-txt-secondary/40 w-6">{i + 1}</span>
                      <span className="text-sm font-medium text-txt-primary">{c.username}</span>
                      <RoleBadge role={c.role} />
                      <span className="text-xs text-txt-secondary ml-auto">
                        {c.count} {c.count === 1 ? "contribution" : "contributions"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Most Discussed Post */}
            {leaderboard.mostDiscussedPost && (
              <div>
                <h3 className="text-sm font-semibold text-txt-primary mb-2">Most Discussed Post</h3>
                <Link
                  href={`/post/${leaderboard.mostDiscussedPost.id}`}
                  className="text-sm text-accent hover:text-accent-hover hover:underline"
                >
                  {leaderboard.mostDiscussedPost.title}
                </Link>
                <span className="text-xs text-txt-secondary ml-2">
                  ({leaderboard.mostDiscussedPost.comment_count} comments)
                </span>
              </div>
            )}

            {/* Question of the Week */}
            {leaderboard.questionOfTheWeek && (
              <div>
                <h3 className="text-sm font-semibold text-txt-primary mb-2">Question of the Week</h3>
                <p className="text-sm text-txt-secondary italic">&ldquo;{leaderboard.questionOfTheWeek}&rdquo;</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Print button */}
      <div className="flex justify-end no-print">
        <button
          onClick={() => window.print()}
          className="text-sm text-txt-secondary hover:text-txt-primary font-medium flex items-center gap-1.5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Download as PDF
        </button>
      </div>
    </div>
  );
}
