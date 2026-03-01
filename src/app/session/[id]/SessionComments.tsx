"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import CommentItem from "@/components/CommentItem";
import { buildCommentTree } from "@/lib/comment-tree";
import type { Comment } from "@/lib/comment-types";

export default function SessionComments({
  sessionId,
  initialComments,
}: {
  sessionId: number;
  initialComments: Comment[];
}) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isAdmin = profile?.role === "Admin";

  const tree = buildCommentTree(comments);

  function handleUpdate(id: number, newBody: string) {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, body: newBody } : c)));
  }

  function handleDelete(id: number) {
    setComments((prev) => prev.filter((c) => c.id !== id && c.parent_id !== id));
  }

  async function handleLikeToggle(commentId: number) {
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
      if (!res.ok) throw new Error("Like failed");
      const data = await res.json();
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, like_count: data.like_count, user_has_liked: data.liked }
            : c
        )
      );
    } catch {
      // CommentItem handles optimistic revert
    }
  }

  async function handleReply(parentId: number, replyBody: string) {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, parent_id: parentId, body: replyBody }),
    });
    if (!res.ok) throw new Error("Reply failed");
    const nc = await res.json();
    setComments((prev) => [...prev, { ...nc, user_has_liked: false, like_count: nc.like_count ?? 0, parent_id: nc.parent_id ?? null }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, body: body.trim() }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed"); }
      const newComment = await res.json();
      setComments((prev) => [...prev, { ...newComment, user_has_liked: false, like_count: newComment.like_count ?? 0, parent_id: null }]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2 className="text-[11px] uppercase tracking-widest text-[rgba(255,255,255,0.3)] font-medium mb-4">
        Comments {comments.length > 0 && <span className="text-[rgba(255,255,255,0.2)]">({comments.length})</span>}
      </h2>

      {tree.length > 0 ? (
        <div className="space-y-0.5 mb-5">
          {tree.map((node) => (
            <CommentItem
              key={node.id}
              comment={node}
              userId={user?.id}
              isAdmin={isAdmin}
              depth={0}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onLikeToggle={handleLikeToggle}
              onReply={handleReply}
              variant="session"
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-[13px] text-[rgba(255,255,255,0.25)] py-6 mb-4">
          No comments yet. Start the conversation.
        </p>
      )}

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            id="new-session-comment"
            name="new-session-comment"
            type="text"
            placeholder="Add a comment..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-sm text-txt-primary placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(255,255,255,0.15)] focus:ring-1 focus:ring-[rgba(255,255,255,0.06)] transition-all duration-200"
          />
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="text-[13px] text-white bg-emerald-500/90 hover:bg-emerald-500 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-40 shrink-0 font-medium"
          >
            {submitting ? "..." : "Post"}
          </button>
          {error && <p className="text-sm text-txt-tertiary ml-1">{error}</p>}
        </form>
      )}
    </section>
  );
}
