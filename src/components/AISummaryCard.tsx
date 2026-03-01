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
    <div className="border-l-2 border-ai-indigo pl-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-medium text-txt-tertiary">✦ AI Summary</span>
        {generatedAt && (
          <span className="text-[11px] text-txt-tertiary">
            {new Date(generatedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
        {showRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="text-[12px] text-txt-tertiary hover:text-txt-secondary ml-auto disabled:opacity-40"
          >
            {regenerating ? "Regenerating..." : "Regenerate"}
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Themes */}
        {summary.themes.length > 0 && (
          <section>
            <h3 className="text-[12px] uppercase tracking-wider text-txt-tertiary mb-2">Key Themes</h3>
            <div className="space-y-1">
              {summary.themes.map((theme, i) => (
                <div key={i}>
                  <span className="text-sm text-txt-primary">{theme.title}</span>
                  {theme.description && (
                    <span className="text-sm text-txt-tertiary"> &mdash; {theme.description}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quotes */}
        {summary.quotes.length > 0 && (
          <section>
            <h3 className="text-[12px] uppercase tracking-wider text-txt-tertiary mb-2">Notable Quotes</h3>
            <div className="space-y-2">
              {summary.quotes.map((quote, i) => (
                <div key={i} className="border-l border-[rgba(255,255,255,0.1)] pl-3">
                  <p className="text-sm text-[rgba(255,255,255,0.7)] italic">&ldquo;{quote.text}&rdquo;</p>
                  <p className="text-[12px] text-txt-tertiary mt-0.5 flex items-center gap-1">
                    &mdash; {quote.author} <RoleBadge role={quote.role} />
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Open Questions */}
        {summary.open_questions.length > 0 && (
          <section>
            <h3 className="text-[12px] uppercase tracking-wider text-txt-tertiary mb-2">Open Questions</h3>
            <ul className="space-y-1">
              {summary.open_questions.map((q, i) => (
                <li key={i} className="text-sm text-[rgba(255,255,255,0.7)]">{q}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Tensions */}
        {summary.tensions.length > 0 && (
          <section>
            <h3 className="text-[12px] uppercase tracking-wider text-txt-tertiary mb-2">Tensions</h3>
            <ul className="space-y-1">
              {summary.tensions.map((t, i) => (
                <li key={i} className="text-sm text-[rgba(255,255,255,0.7)]">{t.description}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Real-World Connections */}
        {summary.real_world.length > 0 && (
          <section>
            <h3 className="text-[12px] uppercase tracking-wider text-txt-tertiary mb-2">Real-World Connections</h3>
            <ul className="space-y-1">
              {summary.real_world.map((r, i) => (
                <li key={i} className="text-sm text-[rgba(255,255,255,0.7)]">{r.description}</li>
              ))}
            </ul>
          </section>
        )}

        {/* So What */}
        {summary.so_what && (
          <section>
            <h3 className="text-[12px] uppercase tracking-wider text-txt-tertiary mb-2">So What?</h3>
            <p className="text-sm text-txt-primary leading-relaxed">{summary.so_what}</p>
          </section>
        )}

        {/* Narrative */}
        {summary.narrative && (
          <section>
            <button
              onClick={() => setNarrativeExpanded(!narrativeExpanded)}
              className="text-[12px] uppercase tracking-wider text-txt-tertiary hover:text-txt-secondary transition-colors flex items-center gap-1"
            >
              Full Narrative
              <svg
                className={`w-3 h-3 transition-transform ${narrativeExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {narrativeExpanded && (
              <div className="mt-2 text-sm text-[rgba(255,255,255,0.7)] leading-relaxed whitespace-pre-line">
                {summary.narrative}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
