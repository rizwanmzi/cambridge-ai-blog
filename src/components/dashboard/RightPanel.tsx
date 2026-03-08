"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import SessionComments from "@/app/session/[id]/SessionComments";
import type { Comment } from "@/lib/comment-types";

interface RightPanelProps {
  selectedSessionId: number | null;
}

function SkeletonLoader() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.06)]" />
            <div
              className="h-3 rounded bg-[rgba(255,255,255,0.06)]"
              style={{ width: `${60 + i * 10}px` }}
            />
          </div>
          <div
            className="h-3 rounded bg-[rgba(255,255,255,0.04)]"
            style={{ width: `${80 - i * 12}%` }}
          />
          <div
            className="h-3 rounded bg-[rgba(255,255,255,0.03)]"
            style={{ width: `${55 - i * 8}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export default function RightPanel({ selectedSessionId }: RightPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedSessionId) return;
    setLoading(true);
    const supabase = createSupabaseBrowser();

    async function fetchComments() {
      const { data: rawComments } = await supabase
        .from("comments")
        .select("*, profiles(username, role)")
        .eq("session_id", selectedSessionId)
        .order("created_at", { ascending: true });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      let likedIds = new Set<number>();
      if (user && rawComments?.length) {
        const { data: likes } = await supabase
          .from("comment_likes")
          .select("comment_id")
          .eq("user_id", user.id)
          .in(
            "comment_id",
            rawComments.map((c: { id: number }) => c.id)
          );
        if (likes) likedIds = new Set(likes.map((l: { comment_id: number }) => l.comment_id));
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: Comment[] = (rawComments || []).map((c: any) => ({
        ...c,
        user_has_liked: likedIds.has(c.id),
      }));
      setComments(mapped);
      setLoading(false);
    }

    fetchComments();
  }, [selectedSessionId]);

  /* No session selected — placeholder */
  if (!selectedSessionId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6">
        {/* Chat bubble icon */}
        <svg
          className="w-10 h-10 mb-3 text-[rgba(255,255,255,0.12)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 20.25V4.5a2.25 2.25 0 0 1 2.25-2.25h12A2.25 2.25 0 0 1 20.25 4.5v9a2.25 2.25 0 0 1-2.25 2.25H7.961a1.5 1.5 0 0 0-1.06.44l-2.122 2.121a.75.75 0 0 1-1.028-.028Z"
          />
        </svg>
        <p className="text-[13px] text-[rgba(255,255,255,0.25)]">
          Select a session to view discussion
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
        <h2 className="text-[11px] uppercase tracking-widest text-[rgba(255,255,255,0.3)] font-medium">
          Session Discussion
          {!loading && comments.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[10px] text-[rgba(255,255,255,0.4)] font-semibold">
              {comments.length}
            </span>
          )}
        </h2>
      </div>

      {/* Comments area */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <SessionComments
            key={selectedSessionId}
            sessionId={selectedSessionId}
            initialComments={comments}
          />
        )}
      </div>
    </div>
  );
}
