"use client";

import { useState } from "react";
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
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="modal-enter relative bg-dark-surface max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col border border-[rgba(255,255,255,0.08)] rounded-md">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between shrink-0">
          <span className="text-sm font-medium text-white">Catch Me Up</span>
          <button
            onClick={onClose}
            className="text-txt-tertiary hover:text-txt-secondary transition-colors text-[13px]"
          >
            Esc
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1">
          <p className="text-[13px] text-txt-tertiary mb-4">
            Select the last day you attended.
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {[0, 1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 text-[13px] rounded-md transition-colors ${
                  selectedDay === d
                    ? "bg-white text-black"
                    : "text-txt-tertiary hover:text-txt-secondary hover:bg-[rgba(255,255,255,0.03)]"
                }`}
              >
                Day {d}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-white text-black py-2 rounded-md text-sm font-medium hover:bg-[rgba(255,255,255,0.9)] transition-colors disabled:opacity-50 mb-4"
          >
            {loading ? "Generating..." : `Catch me up from Day ${selectedDay}`}
          </button>

          {error && (
            <p className="text-sm text-txt-tertiary mb-4">
              {error} &mdash;{" "}
              <button onClick={handleGenerate} className="text-white hover:underline">try again</button>
            </p>
          )}

          {loading && <AILoadingState />}

          {briefing && !loading && <AISummaryCard summary={briefing} />}
        </div>
      </div>
    </div>
  );
}
