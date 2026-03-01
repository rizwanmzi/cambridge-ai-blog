"use client";

import { useState } from "react";
import SparkleIcon from "./SparkleIcon";
import RoleBadge from "./RoleBadge";
import type { SummaryContent } from "@/lib/anthropic";

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
    <div className="bg-gradient-to-br from-blue-50/50 to-slate-50 rounded-xl border border-blue-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparkleIcon className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-medium text-blue-600">AI-generated summary</span>
          {generatedAt && (
            <span className="text-xs text-navy-400 ml-2">
              {new Date(generatedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        {showRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
          >
            {regenerating ? "Regenerating..." : "Regenerate"}
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Themes */}
        {summary.themes.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-navy-700 mb-3 flex items-center gap-1.5">
              <span>🎯</span> Key Themes
            </h3>
            <div className="flex flex-wrap gap-2">
              {summary.themes.map((theme, i) => (
                <span
                  key={i}
                  className="group relative inline-flex items-center bg-blue-100/80 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-full cursor-default"
                  title={theme.description}
                >
                  {theme.title}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Quotes */}
        {summary.quotes.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-navy-700 mb-3 flex items-center gap-1.5">
              <span>💬</span> Notable Quotes
            </h3>
            <div className="space-y-3">
              {summary.quotes.map((quote, i) => (
                <blockquote
                  key={i}
                  className="border-l-3 border-blue-300 pl-4 py-1"
                >
                  <p className="text-sm text-navy-700 italic">&ldquo;{quote.text}&rdquo;</p>
                  <footer className="mt-1 flex items-center gap-1.5 text-xs text-navy-500">
                    <span>— {quote.author}</span>
                    <RoleBadge role={quote.role} />
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {/* Open Questions */}
        {summary.open_questions.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-navy-700 mb-3 flex items-center gap-1.5">
              <span>❓</span> Open Questions
            </h3>
            <ul className="space-y-2">
              {summary.open_questions.map((q, i) => (
                <li key={i} className="text-sm text-navy-600 flex items-start gap-2">
                  <span className="text-navy-400 mt-0.5 shrink-0">•</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tensions */}
        {summary.tensions.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-navy-700 mb-3 flex items-center gap-1.5">
              <span>⚡</span> Tensions
            </h3>
            <ul className="space-y-2">
              {summary.tensions.map((t, i) => (
                <li key={i} className="text-sm text-navy-600 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5 shrink-0">↔</span>
                  <span>{t.description}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Real-World Connections */}
        {summary.real_world.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-navy-700 mb-3 flex items-center gap-1.5">
              <span>🔗</span> Real-World Connections
            </h3>
            <ul className="space-y-2">
              {summary.real_world.map((r, i) => (
                <li key={i} className="text-sm text-navy-600 flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">→</span>
                  <span>{r.description}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* So What */}
        {summary.so_what && (
          <section className="bg-blue-100/50 rounded-lg p-4 border border-blue-200/50">
            <h3 className="text-sm font-semibold text-navy-700 mb-2 flex items-center gap-1.5">
              <span>✅</span> So What?
            </h3>
            <p className="text-sm text-navy-700 leading-relaxed">{summary.so_what}</p>
          </section>
        )}

        {/* Narrative */}
        {summary.narrative && (
          <section>
            <button
              onClick={() => setNarrativeExpanded(!narrativeExpanded)}
              className="text-sm font-semibold text-navy-700 flex items-center gap-1.5 hover:text-navy-900 transition-colors"
            >
              <span>📖</span> Full Narrative
              <svg
                className={`w-4 h-4 transition-transform ${narrativeExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {narrativeExpanded && (
              <div className="mt-3 text-sm text-navy-600 leading-relaxed whitespace-pre-line">
                {summary.narrative}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
