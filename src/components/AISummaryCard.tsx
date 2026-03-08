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
  isStale?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Section wrapper with expand/collapse                                */
/* ------------------------------------------------------------------ */
function Section({
  title,
  icon,
  iconColor,
  count,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-2 text-left hover:bg-[rgba(255,255,255,0.02)] rounded-lg px-2 -mx-2 transition-colors duration-150"
      >
        <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${iconColor}`}>
          {icon}
        </span>
        <span className="text-[12px] uppercase tracking-wider text-[rgba(255,255,255,0.4)] font-semibold flex-1">
          {title}
          {count !== undefined && count > 0 && (
            <span className="ml-1.5 text-[10px] text-[rgba(255,255,255,0.25)]">({count})</span>
          )}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-[rgba(255,255,255,0.2)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-[2000px] opacity-100 mt-2" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Interactive Theme Card                                              */
/* ------------------------------------------------------------------ */
function ThemeCard({ title, description, index }: { title: string; description: string; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const colors = [
    "from-violet-500/20 to-indigo-500/20 border-violet-500/20",
    "from-blue-500/20 to-cyan-500/20 border-blue-500/20",
    "from-emerald-500/20 to-teal-500/20 border-emerald-500/20",
    "from-amber-500/20 to-orange-500/20 border-amber-500/20",
  ];
  const textColors = [
    "text-violet-300",
    "text-blue-300",
    "text-emerald-300",
    "text-amber-300",
  ];
  const color = colors[index % colors.length];
  const textColor = textColors[index % textColors.length];

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={`w-full text-left rounded-xl border bg-gradient-to-br ${color} p-3.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[13px] font-semibold ${textColor}`}>{title}</span>
        <svg
          className={`w-3 h-3 ${textColor} opacity-50 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {expanded && description && (
        <p className="text-[12px] text-[rgba(255,255,255,0.6)] leading-relaxed mt-2 font-normal">
          {description}
        </p>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Quote Card                                                          */
/* ------------------------------------------------------------------ */
function QuoteCard({ text, author, role }: { text: string; author: string; role: string }) {
  return (
    <div className="relative rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] p-4 overflow-hidden hover:border-violet-500/20 transition-all duration-200">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-violet-500/60 to-indigo-500/40" />
      <span className="absolute top-2 right-3 text-[40px] leading-none text-violet-500/[0.08] font-serif select-none">&rdquo;</span>
      <p className="text-[13px] text-[rgba(255,255,255,0.8)] italic leading-relaxed pl-3 relative z-10">
        &ldquo;{text}&rdquo;
      </p>
      <div className="flex items-center gap-1.5 mt-2.5 pl-3">
        <div className="w-4 h-4 rounded-full bg-violet-500/10 flex items-center justify-center">
          <span className="text-[8px] text-violet-400 font-bold">{author[0]?.toUpperCase()}</span>
        </div>
        <span className="text-[11px] text-[rgba(255,255,255,0.5)] font-medium">{author}</span>
        <RoleBadge role={role} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat pill for the summary header                                    */
/* ------------------------------------------------------------------ */
function StatPill({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-[rgba(255,255,255,0.35)] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-full px-2.5 py-1">
      {icon}
      <span>{count} {label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */
export default function AISummaryCard({
  summary,
  generatedAt,
  showRegenerate,
  onRegenerate,
  regenerating,
  isStale,
}: AISummaryCardProps) {
  const [narrativeExpanded, setNarrativeExpanded] = useState(false);

  const themeCount = summary.themes?.length || 0;
  const quoteCount = summary.quotes?.length || 0;
  const questionCount = summary.open_questions?.length || 0;
  const tensionCount = summary.tensions?.length || 0;

  return (
    <div className="rounded-2xl overflow-hidden border border-violet-500/10 ai-brief-glow">
      {/* ── Gradient header bar ── */}
      <div className="relative bg-gradient-to-r from-violet-500/[0.08] via-indigo-500/[0.06] to-violet-500/[0.08] px-5 py-4">
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.3)]" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
              <span className="text-violet-400 text-base">&#10022;</span>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
                Intelligence Brief
                {isStale && (
                  <span className="text-[9px] uppercase tracking-wider bg-amber-500/15 text-amber-400/70 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                    Updating
                  </span>
                )}
              </h3>
              {generatedAt && (
                <span className="text-[10px] text-[rgba(255,255,255,0.35)]">
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
              disabled={regenerating || !isStale}
              className={`text-[11px] border px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                isStale
                  ? "text-violet-400/60 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/15 border-violet-500/15"
                  : "text-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] cursor-not-allowed"
              } disabled:opacity-40`}
              title={isStale ? "New content added — click to regenerate" : "Summary is up to date"}
            >
              <svg className={`w-3 h-3 ${regenerating ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {regenerating ? "Regenerating..." : isStale ? "Regenerate" : "Up to date"}
            </button>
          )}
        </div>

        {/* Stat pills row */}
        <div className="relative flex flex-wrap gap-2 mt-3">
          <StatPill
            icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
            label="themes"
            count={themeCount}
          />
          <StatPill
            icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
            label="quotes"
            count={quoteCount}
          />
          <StatPill
            icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01" /></svg>}
            label="questions"
            count={questionCount}
          />
          <StatPill
            icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
            label="tensions"
            count={tensionCount}
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="bg-violet-500/[0.02] px-5 py-5 space-y-4">
        {/* ── So What — hero section ── */}
        {summary.so_what && (
          <div className="relative rounded-xl bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.05] border border-violet-500/15 p-5 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500/60 via-indigo-400/60 to-violet-500/60" />
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[11px] uppercase tracking-wider text-violet-400/70 font-semibold mb-1.5">So What?</h3>
                <p className="text-[14px] text-white leading-relaxed font-medium">{summary.so_what}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Key Themes — interactive cards ── */}
        {summary.themes && summary.themes.length > 0 && (
          <Section
            title="Key Themes"
            iconColor="bg-violet-500/10 text-violet-400"
            icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
            count={summary.themes.length}
          >
            <div className="grid gap-2">
              {summary.themes.map((theme, i) => (
                <ThemeCard key={i} title={theme.title} description={theme.description} index={i} />
              ))}
            </div>
          </Section>
        )}

        {/* ── Notable Quotes ── */}
        {summary.quotes && summary.quotes.length > 0 && (
          <Section
            title="Notable Quotes"
            iconColor="bg-indigo-500/10 text-indigo-400"
            icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
            count={summary.quotes.length}
          >
            <div className="space-y-2.5">
              {summary.quotes.map((quote, i) => (
                <QuoteCard key={i} text={quote.text} author={quote.author} role={quote.role} />
              ))}
            </div>
          </Section>
        )}

        {/* ── Open Questions ── */}
        {summary.open_questions && summary.open_questions.length > 0 && (
          <Section
            title="Open Questions"
            iconColor="bg-amber-500/10 text-amber-400"
            icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01" /></svg>}
            count={summary.open_questions.length}
          >
            <div className="space-y-2">
              {summary.open_questions.map((q, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg bg-amber-500/[0.03] border border-amber-500/10 px-3.5 py-2.5 hover:border-amber-500/20 transition-colors duration-150"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] text-amber-400 font-bold">?</span>
                  </span>
                  <p className="text-[13px] text-[rgba(255,255,255,0.7)] leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Tensions ── */}
        {summary.tensions && summary.tensions.length > 0 && (
          <Section
            title="Tensions"
            iconColor="bg-rose-500/10 text-rose-400"
            icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
            count={summary.tensions.length}
          >
            <div className="space-y-2">
              {summary.tensions.map((t, i) => (
                <div
                  key={i}
                  className="relative rounded-lg border border-rose-500/10 bg-rose-500/[0.03] px-3.5 py-2.5 hover:border-rose-500/20 transition-colors duration-150 overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-rose-500/40 to-orange-500/30" />
                  <p className="text-[13px] text-[rgba(255,255,255,0.7)] leading-relaxed pl-2">{t.description}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Action Items ── */}
        {summary.action_items && summary.action_items.length > 0 && (
          <Section
            title="Action Items"
            iconColor="bg-emerald-500/10 text-emerald-400"
            icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
            count={summary.action_items.length}
          >
            <div className="space-y-1.5">
              {summary.action_items.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 px-1">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <p className="text-[13px] text-[rgba(255,255,255,0.7)] leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Real-World Connections ── */}
        {summary.real_world && summary.real_world.length > 0 && (
          <Section
            title="Real-World Connections"
            iconColor="bg-cyan-500/10 text-cyan-400"
            icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            count={summary.real_world.length}
          >
            <div className="space-y-2">
              {summary.real_world.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5 px-1">
                  <span className="text-cyan-400/40 mt-1.5 shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /></svg>
                  </span>
                  <p className="text-[13px] text-[rgba(255,255,255,0.7)] leading-relaxed">{r.description}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Full Narrative — collapsible ── */}
        {summary.narrative && (
          <div className="border-t border-violet-500/10 pt-3">
            <button
              onClick={() => setNarrativeExpanded(!narrativeExpanded)}
              className="w-full text-left flex items-center gap-2 py-2 hover:bg-[rgba(255,255,255,0.02)] rounded-lg px-2 -mx-2 transition-colors duration-150"
            >
              <span className="w-6 h-6 rounded-md bg-violet-500/10 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </span>
              <span className="text-[12px] uppercase tracking-wider text-[rgba(255,255,255,0.4)] font-semibold flex-1">
                Full Narrative
              </span>
              <svg
                className={`w-3.5 h-3.5 text-[rgba(255,255,255,0.2)] transition-transform duration-200 ${narrativeExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                narrativeExpanded ? "max-h-[3000px] opacity-100 mt-2" : "max-h-0 opacity-0"
              }`}
            >
              <div className="bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.04)] p-4">
                <div className="text-[13px] text-[rgba(255,255,255,0.65)] leading-[1.8] whitespace-pre-line">
                  {summary.narrative}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
