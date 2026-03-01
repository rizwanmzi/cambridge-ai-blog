"use client";

import { useState } from "react";
import SparkleIcon from "./SparkleIcon";
import AISummaryCard from "./AISummaryCard";
import AILoadingState from "./AILoadingState";
import type { SummaryContent } from "@/lib/anthropic";

export default function DaySummaryAccordion({ dayNumber }: { dayNumber: number }) {
  const [expanded, setExpanded] = useState(false);
  const [summary, setSummary] = useState<SummaryContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const handleToggle = async () => {
    if (!expanded && !loaded) {
      setExpanded(true);
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ai/day-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day_number: dayNumber }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setSummary(data.summary);
        setLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover font-medium transition-colors"
      >
        <SparkleIcon className="w-3.5 h-3.5" />
        <span>AI Day Summary</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-3">
          {loading && <AILoadingState />}
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}
          {summary && <AISummaryCard summary={summary} />}
        </div>
      )}
    </div>
  );
}
