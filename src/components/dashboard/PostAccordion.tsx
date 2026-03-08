"use client";

import { useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RoleBadge from "@/components/RoleBadge";
import TimeAgo from "@/components/TimeAgo";
import CommentSection from "@/app/post/[id]/CommentSection";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import type { PostListItem } from "@/lib/dashboard-types";
import type { Comment } from "@/lib/comment-types";

interface PostAccordionProps {
  post: PostListItem;
  isExpanded: boolean;
  onToggle: () => void;
}

const categoryPillClass: Record<string, string> = {
  "Live Insight": "cat-pill-live-insight",
  "Formal Notes": "cat-pill-formal-notes",
  "Key Takeaway": "cat-pill-key-takeaway",
  Reflection: "cat-pill-reflection",
};

const categoryBorderColor: Record<string, string> = {
  "Live Insight": "rgba(74,222,128,0.5)",
  "Formal Notes": "rgba(96,165,250,0.5)",
  "Key Takeaway": "rgba(251,191,36,0.5)",
  Reflection: "rgba(192,132,252,0.5)",
};

const categoryGlowColor: Record<string, string> = {
  "Live Insight": "rgba(74,222,128,0.08)",
  "Formal Notes": "rgba(96,165,250,0.08)",
  "Key Takeaway": "rgba(251,191,36,0.08)",
  Reflection: "rgba(192,132,252,0.08)",
};

function CommentShimmer() {
  return (
    <div className="space-y-3 animate-pulse pt-4">
      {[1, 2].map((i) => (
        <div key={i} className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.06)] shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded bg-[rgba(255,255,255,0.06)]" />
            <div className="h-3 w-full rounded bg-[rgba(255,255,255,0.04)]" />
            <div className="h-3 w-2/3 rounded bg-[rgba(255,255,255,0.04)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PostAccordion({
  post,
  isExpanded,
  onToggle,
}: PostAccordionProps) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);

  const borderColor = categoryBorderColor[post.category] || "transparent";
  const glowColor = categoryGlowColor[post.category] || "transparent";
  const pillClass =
    categoryPillClass[post.category] ||
    "text-txt-tertiary bg-[rgba(255,255,255,0.05)]";

  const snippet =
    post.body.length > 120 ? `${post.body.slice(0, 120).trimEnd()}...` : post.body;

  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const supabase = createSupabaseBrowser();
      const { data: rawComments } = await supabase
        .from("comments")
        .select("*, profiles(username, role)")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      let likedIds = new Set<number>();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && rawComments?.length) {
        const { data: likes } = await supabase
          .from("comment_likes")
          .select("comment_id")
          .eq("user_id", user.id)
          .in(
            "comment_id",
            rawComments.map((c: { id: number }) => c.id)
          );
        if (likes) {
          likedIds = new Set(
            likes.map((l: { comment_id: number }) => l.comment_id)
          );
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const merged: Comment[] = (rawComments || []).map((c: any) => ({
        ...c,
        user_has_liked: likedIds.has(c.id),
      }));

      setComments(merged);
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [post.id]);

  useEffect(() => {
    if (isExpanded && comments === null) {
      fetchComments();
    }
  }, [isExpanded, comments, fetchComments]);

  return (
    <div
      className="rounded-xl border-l-[3px] transition-all duration-200"
      style={{
        borderLeftColor: borderColor,
        background: isExpanded ? glowColor : "transparent",
      }}
    >
      {/* Clickable header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-start gap-3 group hover:bg-[rgba(255,255,255,0.03)] rounded-r-xl transition-colors duration-200"
      >
        {/* Chevron */}
        <svg
          className={`w-4 h-4 mt-0.5 shrink-0 text-[rgba(255,255,255,0.3)] transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-sm text-white truncate">
              {post.title}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${pillClass}`}
            >
              {post.category}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 text-[12px] text-[rgba(255,255,255,0.4)]">
            {post.profiles && (
              <>
                <span>{post.profiles.username}</span>
                <RoleBadge role={post.profiles.role} />
                <span className="text-[rgba(255,255,255,0.15)]">&middot;</span>
              </>
            )}
            <TimeAgo date={post.created_at} />
          </div>

          {/* Preview snippet (collapsed only) */}
          {!isExpanded && (
            <p className="text-[13px] text-[rgba(255,255,255,0.35)] mt-1.5 line-clamp-2">
              {snippet}
            </p>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1">
          {/* Full markdown body */}
          <div className="prose prose-invert prose-sm max-w-none mb-6 pl-7 overflow-x-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.body}
            </ReactMarkdown>
          </div>

          {/* Comments */}
          <div className="pl-7 border-t border-[rgba(255,255,255,0.06)] pt-4">
            {loadingComments ? (
              <CommentShimmer />
            ) : comments !== null ? (
              <CommentSection postId={post.id} initialComments={comments} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
