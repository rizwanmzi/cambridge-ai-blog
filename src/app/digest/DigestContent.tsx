"use client";

import { useState, useEffect } from "react";
import AISummaryCard from "@/components/AISummaryCard";
import AILoadingState from "@/components/AILoadingState";
import RoleBadge from "@/components/RoleBadge";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import type { SummaryContent } from "@/lib/ai-types";

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
      <p className="text-sm text-txt-tertiary">
        {error} &mdash;{" "}
        <button onClick={() => loadDigest()} className="text-white hover:underline">try again</button>
      </p>
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

      {leaderboard && (
        <div>
          <h2 className="text-[12px] uppercase tracking-wider text-txt-tertiary mb-4">Leaderboard</h2>

          {leaderboard.topContributors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[13px] text-txt-secondary mb-2">Top Contributors</h3>
              <div className="space-y-1.5">
                {leaderboard.topContributors.map((c, i) => (
                  <div key={c.username} className="flex items-center gap-2 text-sm">
                    <span className="text-txt-tertiary w-4">{i + 1}.</span>
                    <span className="text-txt-primary">{c.username}</span>
                    <RoleBadge role={c.role} />
                    <span className="text-txt-tertiary ml-auto text-[13px]">
                      {c.count} {c.count === 1 ? "post" : "posts"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {leaderboard.mostDiscussedPost && (
            <div className="mb-6">
              <h3 className="text-[13px] text-txt-secondary mb-1">Most Discussed</h3>
              <Link
                href={`/post/${leaderboard.mostDiscussedPost.id}`}
                className="text-sm text-white hover:underline"
              >
                {leaderboard.mostDiscussedPost.title}
              </Link>
              <span className="text-[13px] text-txt-tertiary ml-2">
                {leaderboard.mostDiscussedPost.comment_count} comments
              </span>
            </div>
          )}

          {leaderboard.questionOfTheWeek && (
            <div>
              <h3 className="text-[13px] text-txt-secondary mb-1">Question of the Week</h3>
              <p className="text-sm text-[rgba(255,255,255,0.7)] italic">
                &ldquo;{leaderboard.questionOfTheWeek}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end no-print">
        <button
          onClick={() => window.print()}
          className="text-[13px] text-txt-tertiary hover:text-txt-secondary transition-colors"
        >
          Download as PDF
        </button>
      </div>
    </div>
  );
}
