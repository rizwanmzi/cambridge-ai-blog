"use client";

import { useState } from "react";
import RoleBadge from "./RoleBadge";
import type { SummaryContent } from "@/lib/ai-types";

interface AISummaryCardProps {
  summary: SummaryContent;
  generatedAt?: string;
  showRegenerate?: boolean;
  onRegenerate?: () => void;
  regenerating?: boolean;
}

export default function AISummaryCard({
  summary,
  generatedAt,
  showRegenerate,
  onRegenerate,
  regenerating,
}: AISummaryCardProps) {
  const [narrativeExpanded, setNarrativeExpanded] = useState(false);

  return (
    <div className="bg-violet-500/[0.03] border border-violet-500/10 rounded-2xl p-5 ai-brief-glow">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <span className="text-violet-400 text-xs">&#10022;</span>
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-violet-300">Intelligence Brief</h3>
            {generatedAt && (
              <span className="text-[10px] text-txt-tertiary">
                {new Date(generatedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>
        {showRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="text-[11px] text-violet-400/60 hover:text-violet-300 bg-violet-500/5 hover:bg-violet-500/10 border border-violet-500/10 px-3 py-1.5 rounded-full disabled:opacity-40 transition-all duration-200"
          >
            {regenerating ? "Regenerating..." : "Regenerate"}
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* So What — prominently at the top */}
        {summary.so_what && (
          <section className="relative bg-violet-500/[0.06] border border-violet-500/15 rounded-xl p-4 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500/50 via-indigo-500/50 to-violet-500/50" />
            <h3 className="text-[11px] uppercase tracking-widest text-violet-400/70 font-medium mb-2 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              So What?
            </h3>
            <p className="text-sm text-txt-primary leading-relaxed">{summary.so_what}</p>
          </section>
        )}

        {/* Themes — badge list */}
        {summary.themes.length > 0 && (
          <section>
            <h3 className="text-[11px] uppercase tracking-widest text-[rgba(255,255,255,0.3)] font-medium mb-3">Key Themes</h3>
            <div className="flex flex-wrap gap-2">
              {summary.themes.map((theme, i) => (
                <div key={i} className="group relative">
                  <span className="inline-flex items-center text-[12px] font-medium text-violet-300/90 bg-violet-500/10 border border-violet-500/15 px-3 py-1.5 rounded-full hover:bg-violet-500/15 transition-all duration-200 cursor-default">
                    {theme.title}
                  </span>
                  {theme.description && (
                    <div className="absolute z-10 bottom-full left-0 mb-2 w-64 p-3 bg-dark-surface border border-[rgba(255,255,255,0.1)] rounded-xl shadow-xl text-[12px] text-txt-secondary leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
                      {theme.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quotes — glowing borders */}
        {summary.quotes.length > 0 && (
          <section>
            <h3 className="text-[11px] uppercase tracking-widest text-[rgba(255,255,255,0.3)] font-medium mb-3">Notable Quotes</h3>
            <div className="space-y-3">
              {summary.quotes.map((quote, i) => (
                <div key={i} className="ai-quote-glow pl-4 py-2.5 rounded-r-lg bg-violet-500/[0.03]">
                  <p className="text-sm text-[rgba(255,255,255,0.75)] italic leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
                  <p className="text-[12px] text-txt-tertiary mt-1.5 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-violet-400/40" />
                    {quote.author} <RoleBadge role={quote.role} />
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Open Questions */}
        {summary.open_questions.length > 0 && (
          <section>
            <h3 className="text-[11px] uppercase tracking-widest text-[rgba(255,255,255,0.3)] font-medium mb-3 flex items-center gap-1.5">
              <svg className="w-3 h-3 text-amber-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01" />
              </svg>
              Open Questions
            </h3>
            <ul className="space-y-2">
              {summary.open_questions.map((q, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[rgba(255,255,255,0.65)]">
                  <span className="text-amber-400/40 mt-1.5 shrink-0 text-[8px]">&#9679;</span>
                  {q}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tensions */}
        {summary.tensions.length > 0 && (
          <section>
            <h3 className="text-[11px] uppercase tracking-widest text-[rgba(255,255,255,0.3)] font-medium mb-3 flex items-center gap-1.5">
              <svg className="w-3 h-3 text-rose-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Tensions
            </h3>
            <ul className="space-y-2">
              {summary.tensions.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[rgba(255,255,255,0.65)]">
                  <span className="text-rose-400/40 mt-1.5 shrink-0 text-[8px]">&#9679;</span>
                  {t.description}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Real-World Connections */}
        {summary.real_world.length > 0 && (
          <section>
            <h3 className="text-[11px] uppercase tracking-widest text-[rgba(255,255,255,0.3)] font-medium mb-3 flex items-center gap-1.5">
              <svg className="w-3 h-3 text-emerald-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Real-World Connections
            </h3>
            <ul className="space-y-2">
              {summary.real_world.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[rgba(255,255,255,0.65)]">
                  <span className="text-emerald-400/40 mt-1.5 shrink-0 text-[8px]">&#9679;</span>
                  {r.description}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Narrative — collapsible */}
        {summary.narrative && (
          <section className="border-t border-violet-500/10 pt-4">
            <button
              onClick={() => setNarrativeExpanded(!narrativeExpanded)}
              className="w-full text-left text-[11px] uppercase tracking-widest text-[rgba(255,255,255,0.3)] hover:text-[rgba(255,255,255,0.5)] font-medium transition-colors duration-200 flex items-center justify-between"
            >
              <span>Full Narrative</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-300 ${narrativeExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                narrativeExpanded ? "max-h-[2000px] opacity-100 mt-3" : "max-h-0 opacity-0"
              }`}
            >
              <div className="text-sm text-[rgba(255,255,255,0.65)] leading-relaxed whitespace-pre-line">
                {summary.narrative}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
