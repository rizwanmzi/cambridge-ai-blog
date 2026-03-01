"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import CommentItem from "@/components/CommentItem";
import { buildCommentTree } from "@/lib/comment-tree";
import type { Comment } from "@/lib/comment-types";

export default function CommentSection({ postId, initialComments }: { postId: number; initialComments: Comment[] }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isAdmin = profile?.role === "Admin";

  const tree = buildCommentTree(comments);

  function handleUpdate(id: number, newBody: string) {
    setComments((p) => p.map((c) => c.id === id ? { ...c, body: newBody } : c));
  }

  function handleDelete(id: number) {
    setComments((p) => p.filter((c) => c.id !== id && c.parent_id !== id));
  }

  async function handleLikeToggle(commentId: number) {
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
      if (!res.ok) throw new Error("Like failed");
      const data = await res.json();
      setComments((p) =>
        p.map((c) =>
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
      body: JSON.stringify({ post_id: postId, parent_id: parentId, body: replyBody }),
    });
    if (!res.ok) throw new Error("Reply failed");
    const nc = await res.json();
    setComments((p) => [...p, { ...nc, user_has_liked: false, like_count: nc.like_count ?? 0, parent_id: nc.parent_id ?? null }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, body: body.trim() }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed"); }
      const nc = await res.json();
      setComments((p) => [...p, { ...nc, user_has_liked: false, like_count: nc.like_count ?? 0, parent_id: null }]);
      setBody("");
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong. Try again."); }
    finally { setSubmitting(false); }
  }

  return (
    <section>
      <h2 className="text-[12px] uppercase tracking-wider text-txt-tertiary mb-4">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>
      {tree.length > 0 ? (
        <div className="space-y-1 mb-6">
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
              variant="post"
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-txt-tertiary mb-6">No comments yet.</p>
      )}
      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2 items-start">
          <input id="new-comment" name="new-comment" type="text" placeholder="Add a comment..." value={body} onChange={(e) => setBody(e.target.value)} required
            className="flex-1 bg-transparent border-b border-dark-border focus:border-[rgba(255,255,255,0.25)] py-2 text-sm text-txt-primary placeholder-txt-tertiary focus:outline-none" />
          <button type="submit" disabled={submitting || !body.trim()}
            className="text-[13px] text-white bg-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-md hover:bg-[rgba(255,255,255,0.15)] disabled:opacity-40 shrink-0">
            {submitting ? "..." : "Post"}
          </button>
          {error && <p className="text-sm text-txt-tertiary ml-2">{error}</p>}
        </form>
      )}
    </section>
  );
}
