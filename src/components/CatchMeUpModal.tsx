"use client";

import { useState } from "react";
import SparkleIcon from "./SparkleIcon";
import AISummaryCard from "./AISummaryCard";
import AILoadingState from "./AILoadingState";
import type { SummaryContent } from "@/lib/anthropic";

interface CatchMeUpModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CatchMeUpModal({ open, onClose }: CatchMeUpModalProps) {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [briefing, setBriefing] = useState<SummaryContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setBriefing(null);
    try {
      const res = await fetch("/api/ai/catch-me-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ last_day_seen: selectedDay }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      if (typeof data.briefing === "string") {
        setBriefing({
          themes: [],
          quotes: [],
          open_questions: [],
          tensions: [],
          action_items: [],
          real_world: [],
          so_what: data.briefing,
          narrative: "",
        });
      } else {
        setBriefing(data.briefing);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-dark-surface rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col border border-[rgba(255,255,255,0.06)]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <SparkleIcon className="w-5 h-5 text-txt-secondary" />
            <h2 className="text-lg font-heading font-semibold text-white">Catch Me Up</h2>
          </div>
          <button
            onClick={onClose}
            className="text-txt-secondary hover:text-txt-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-sm text-txt-secondary mb-4">
            Select the last day you attended, and I&apos;ll brief you on everything since.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {[0, 1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                  selectedDay === d
                    ? "bg-accent text-white"
                    : "bg-dark-hover text-txt-secondary hover:text-txt-primary border border-[rgba(255,255,255,0.06)]"
                }`}
              >
                Day {d}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 mb-6"
          >
            {loading ? "Generating briefing..." : `Catch me up from Day ${selectedDay}`}
          </button>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          {loading && <AILoadingState />}

          {briefing && !loading && <AISummaryCard summary={briefing} />}
        </div>
      </div>
    </div>
  );
}
