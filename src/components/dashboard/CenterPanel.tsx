"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/auth-context";
import AISummaryCard from "@/components/AISummaryCard";
import QuickPostBar from "@/components/QuickPostBar";
import PostAccordion from "@/components/dashboard/PostAccordion";
import type { PostListItem, SessionDetail } from "@/lib/dashboard-types";
import type { SummaryContent } from "@/lib/ai-types";

interface CenterPanelProps {
  selectedSessionId: number | null;
  expandedPostId: number | null;
  onExpandPost: (id: number | null) => void;
}

interface SessionPhoto {
  id: number;
  session_id: number;
  uploaded_by: string;
  file_path: string;
  file_name: string;
  caption: string | null;
  created_at: string;
}

interface CachedSummary {
  summary: SummaryContent;
  generatedAt: string;
  isStale: boolean;
}

/* ------------------------------------------------------------------ */
/*  Shimmer skeleton shown while session data is loading               */
/* ------------------------------------------------------------------ */
function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-8 animate-pulse">
      {/* Session header skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-20 rounded-full bg-[rgba(255,255,255,0.06)]" />
        <div className="h-7 w-3/4 rounded bg-[rgba(255,255,255,0.06)]" />
        <div className="h-4 w-1/3 rounded bg-[rgba(255,255,255,0.04)]" />
        <div className="h-4 w-1/2 rounded bg-[rgba(255,255,255,0.04)]" />
      </div>

      {/* Summary skeleton */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.06)]" />
          <div className="h-4 w-32 rounded bg-[rgba(255,255,255,0.06)]" />
        </div>
        <div className="h-4 w-full rounded bg-[rgba(255,255,255,0.04)]" />
        <div className="h-4 w-5/6 rounded bg-[rgba(255,255,255,0.04)]" />
        <div className="h-4 w-2/3 rounded bg-[rgba(255,255,255,0.04)]" />
      </div>

      {/* Posts skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-24 rounded bg-[rgba(255,255,255,0.06)]" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border-l-[3px] border-[rgba(255,255,255,0.08)] p-4 space-y-2"
          >
            <div className="h-4 w-2/3 rounded bg-[rgba(255,255,255,0.06)]" />
            <div className="h-3 w-1/3 rounded bg-[rgba(255,255,255,0.04)]" />
            <div className="h-3 w-full rounded bg-[rgba(255,255,255,0.03)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Summary shimmer (used when only the AI brief is loading)           */
/* ------------------------------------------------------------------ */
function SummaryShimmer() {
  return (
    <div className="rounded-2xl border border-violet-500/10 p-5 space-y-4 animate-pulse bg-violet-500/[0.02]">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-violet-500/10" />
        <div className="h-4 w-32 rounded bg-violet-500/10" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-violet-500/[0.06]" />
        <div className="h-4 w-5/6 rounded bg-violet-500/[0.06]" />
        <div className="h-4 w-2/3 rounded bg-violet-500/[0.06]" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-20 rounded-full bg-violet-500/[0.06]" />
          <div className="h-6 w-24 rounded-full bg-violet-500/[0.06]" />
          <div className="h-6 w-16 rounded-full bg-violet-500/[0.06]" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Welcome state (no session selected)                                */
/* ------------------------------------------------------------------ */
function WelcomeState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      {/* Decorative element */}
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-emerald-400/70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-semibold text-white mb-2">
        Cambridge AI Leadership Programme
      </h1>
      <p className="text-[15px] text-[rgba(255,255,255,0.5)] mb-8">
        Cohort 2 — Live Learning AI Blog
      </p>
      <p className="text-sm text-[rgba(255,255,255,0.3)] flex items-center gap-2">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
          />
        </svg>
        Select a session from the sidebar to begin
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Photos strip                                                       */
/* ------------------------------------------------------------------ */
function PhotosStrip({ photos }: { photos: SessionPhoto[] }) {
  const supabase = createSupabaseBrowser();

  if (photos.length === 0) return null;

  return (
    <section>
      <h3 className="text-[11px] uppercase tracking-widest text-[rgba(255,255,255,0.3)] font-medium mb-3 flex items-center gap-2">
        <svg
          className="w-3.5 h-3.5 text-[rgba(255,255,255,0.25)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Photos
        <span className="text-[10px] text-[rgba(255,255,255,0.2)] font-normal">
          ({photos.length})
        </span>
      </h3>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
        {photos.map((photo) => {
          const {
            data: { publicUrl },
          } = supabase.storage
            .from("session-photos")
            .getPublicUrl(photo.file_path);

          return (
            <div
              key={photo.id}
              className="relative group shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publicUrl}
                alt={photo.caption || photo.file_name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Caption on hover */}
              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-[10px] text-white/80 truncate">
                    {photo.caption}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ================================================================== */
/*  CenterPanel                                                        */
/* ================================================================== */
export default function CenterPanel({
  selectedSessionId,
  expandedPostId,
  onExpandPost,
}: CenterPanelProps) {
  const { profile } = useAuth();

  // Data state
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [photos, setPhotos] = useState<SessionPhoto[]>([]);
  const [loading, setLoading] = useState(false);

  // AI summary state
  const [summary, setSummary] = useState<CachedSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const summaryCache = useRef<Record<number, CachedSummary>>({});

  const isAdmin = profile?.role === "Admin";

  /* ---------------------------------------------------------------- */
  /*  Fetch AI summary (with caching)                                  */
  /* ---------------------------------------------------------------- */
  const fetchSummary = useCallback(
    async (sessionId: number, bypassCache = false) => {
      if (!bypassCache && summaryCache.current[sessionId]) {
        setSummary(summaryCache.current[sessionId]);
        return;
      }

      setSummaryLoading(true);
      try {
        const res = await fetch("/api/ai/session-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
        const data = await res.json();

        if (data.summary) {
          const cached: CachedSummary = {
            summary: data.summary,
            generatedAt: data.generated_at || new Date().toISOString(),
            isStale: data.is_stale ?? false,
          };
          summaryCache.current[sessionId] = cached;
          setSummary(cached);
        } else {
          setSummary(null);
        }
      } catch {
        setSummary(null);
      } finally {
        setSummaryLoading(false);
      }
    },
    []
  );

  /* ---------------------------------------------------------------- */
  /*  Regenerate handler                                               */
  /* ---------------------------------------------------------------- */
  const handleRegenerate = useCallback(async () => {
    if (!selectedSessionId) return;
    setRegenerating(true);
    try {
      const res = await fetch("/api/ai/session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: selectedSessionId, regenerate: true }),
      });
      const data = await res.json();
      if (data.summary) {
        const cached: CachedSummary = {
          summary: data.summary,
          generatedAt: data.generated_at || new Date().toISOString(),
          isStale: false,
        };
        summaryCache.current[selectedSessionId] = cached;
        setSummary(cached);
      }
    } catch {
      // silently fail regeneration
    } finally {
      setRegenerating(false);
    }
  }, [selectedSessionId]);

  /* ---------------------------------------------------------------- */
  /*  Main data fetch — keyed on selectedSessionId                     */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!selectedSessionId) {
      setSession(null);
      setPosts([]);
      setPhotos([]);
      setSummary(null);
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowser();

    // Fetch session detail + posts + photos in parallel
    Promise.all([
      supabase
        .from("sessions")
        .select("*")
        .eq("id", selectedSessionId)
        .single(),
      supabase
        .from("posts")
        .select("*, profiles(username, role)")
        .eq("session_id", selectedSessionId)
        .order("created_at", { ascending: false }),
      supabase
        .from("session_photos")
        .select("*")
        .eq("session_id", selectedSessionId)
        .order("created_at", { ascending: false }),
    ]).then(([sessionRes, postsRes, photosRes]) => {
      setSession(sessionRes.data as SessionDetail | null);
      setPosts((postsRes.data as PostListItem[]) || []);
      setPhotos((photosRes.data as SessionPhoto[]) || []);
      setLoading(false);
    });

    // Fetch AI summary (separate, may be cached)
    fetchSummary(selectedSessionId);
  }, [selectedSessionId, fetchSummary]);

  /* ---------------------------------------------------------------- */
  /*  Render: welcome state                                            */
  /* ---------------------------------------------------------------- */
  if (!selectedSessionId) {
    return <WelcomeState />;
  }

  /* ---------------------------------------------------------------- */
  /*  Render: loading state                                            */
  /* ---------------------------------------------------------------- */
  if (loading || !session) {
    return <LoadingSkeleton />;
  }

  /* ---------------------------------------------------------------- */
  /*  Render: session content                                          */
  /* ---------------------------------------------------------------- */
  const timeRange = `${session.start_time.slice(0, 5)}–${session.end_time.slice(0, 5)}`;

  return (
    <div className="p-6 space-y-8 overflow-y-auto h-full">
      {/* ── 1. Session Header ────────────────────────────────────── */}
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            Day {session.day_number}
          </span>
          {session.is_social && (
            <span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
              Social
            </span>
          )}
        </div>

        <h1 className="text-2xl font-semibold text-white leading-tight">
          {session.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-[rgba(255,255,255,0.5)]">
          <span className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {timeRange}
          </span>

          {session.faculty && (
            <>
              <span className="text-[rgba(255,255,255,0.15)]">&middot;</span>
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {session.faculty}
              </span>
            </>
          )}
        </div>

        {session.description && (
          <p className="text-sm text-[rgba(255,255,255,0.4)] leading-relaxed mt-1">
            {session.description}
          </p>
        )}
      </header>

      {/* ── 2. AI Intelligence Brief ─────────────────────────────── */}
      <section>
        {summaryLoading ? (
          <SummaryShimmer />
        ) : summary ? (
          <AISummaryCard
            summary={summary.summary}
            generatedAt={summary.generatedAt}
            showRegenerate={isAdmin}
            onRegenerate={handleRegenerate}
            regenerating={regenerating}
            isStale={summary.isStale}
          />
        ) : isAdmin ? (
          <div className="rounded-2xl border border-dashed border-violet-500/20 p-6 text-center bg-violet-500/[0.02]">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-violet-400 text-sm">&#10022;</span>
            </div>
            <p className="text-sm text-[rgba(255,255,255,0.5)] mb-3">
              No AI summary generated yet for this session.
            </p>
            <button
              onClick={() =>
                selectedSessionId && fetchSummary(selectedSessionId, true)
              }
              disabled={summaryLoading}
              className="text-sm font-medium text-violet-300 bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-40"
            >
              Generate Summary
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] p-5 text-center bg-[rgba(255,255,255,0.02)]">
            <p className="text-sm text-[rgba(255,255,255,0.35)]">
              No AI summary available yet.
            </p>
          </div>
        )}
      </section>

      {/* ── 3. Posts Section ──────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <h2 className="text-[13px] font-semibold text-white uppercase tracking-widest">
            Posts
          </h2>
          <span className="text-[11px] font-medium text-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.06)] px-2 py-0.5 rounded-full">
            {posts.length}
          </span>
        </div>

        <QuickPostBar sessionId={selectedSessionId} />

        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-[rgba(255,255,255,0.35)]">
              No posts yet for this session.
            </p>
            <p className="text-[13px] text-[rgba(255,255,255,0.2)] mt-1">
              Be the first to share an insight.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <PostAccordion
                key={post.id}
                post={post}
                isExpanded={expandedPostId === post.id}
                onToggle={() =>
                  onExpandPost(expandedPostId === post.id ? null : post.id)
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* ── 4. Photos Strip ──────────────────────────────────────── */}
      <PhotosStrip photos={photos} />
    </div>
  );
}
