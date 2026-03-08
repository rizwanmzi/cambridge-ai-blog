"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RoleBadge from "@/components/RoleBadge";
import TimeAgo from "@/components/TimeAgo";
import ExpandableText from "@/components/ExpandableText";
import type { CommentNode } from "@/lib/comment-types";

interface CommentItemProps {
  comment: CommentNode;
  userId: string | undefined;
  isAdmin: boolean;
  depth: number;
  onUpdate: (id: number, body: string) => void;
  onDelete: (id: number) => void;
  onLikeToggle: (id: number) => void;
  onReply: (parentId: number, body: string) => Promise<void>;
  variant?: "post" | "session";
}

export default function CommentItem({
  comment, userId, isAdmin, depth,
  onUpdate, onDelete, onLikeToggle, onReply, variant = "post",
}: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hovered, setHovered] = useState(false);

  const [replying, setReplying] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const [liked, setLiked] = useState(comment.user_has_liked);
  const [likeCount, setLikeCount] = useState(comment.like_count);
  const [liking, setLiking] = useState(false);

  const canEdit = userId === comment.user_id || isAdmin;
  const isReply = depth > 0;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editBody.trim() }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      onUpdate(comment.id, updated.body);
      setEditing(false);
    } catch { /* keep editing */ } finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDelete(comment.id);
    } catch { setDeleting(false); setShowDelete(false); }
  }

  async function handleLike() {
    if (!userId || liking) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => wasLiked ? c - 1 : c + 1);
    setLiking(true);
    try {
      onLikeToggle(comment.id);
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => wasLiked ? c + 1 : c - 1);
    } finally {
      setLiking(false);
    }
  }

  async function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setReplySubmitting(true);
    try {
      // Always reply to the root-level parent (max 2 levels)
      const effectiveParentId = comment.parent_id === null ? comment.id : comment.parent_id;
      await onReply(effectiveParentId, replyBody.trim());
      setReplyBody("");
      setReplying(false);
    } catch { /* keep form open */ }
    finally { setReplySubmitting(false); }
  }

  return (
    <div className={isReply ? "relative" : ""}>
      <div
        className={`rounded-lg px-3 py-2.5 transition-all duration-200 ${
          hovered ? "bg-[rgba(255,255,255,0.02)]" : ""
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Header */}
        <div className="flex items-center gap-2 text-[13px] text-txt-tertiary mb-1.5">
          <div className="w-5 h-5 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-[10px] text-txt-tertiary shrink-0">
            {(comment.profiles?.username ?? "?")[0].toUpperCase()}
          </div>
          <span className="text-[rgba(255,255,255,0.6)] font-medium text-[12px]">
            {comment.profiles?.username ?? "Unknown"}
          </span>
          {comment.profiles && <RoleBadge role={comment.profiles.role} />}
          <span className="text-[rgba(255,255,255,0.12)]">&middot;</span>
          <TimeAgo date={comment.created_at} />
          {canEdit && hovered && !editing && (
            <span className="ml-auto flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="text-[12px] text-txt-tertiary hover:text-txt-secondary transition-colors duration-200 px-1.5 py-1 -my-1"
              >
                Edit
              </button>
              {!showDelete ? (
                <button
                  onClick={() => setShowDelete(true)}
                  className="text-[12px] text-txt-tertiary hover:text-txt-secondary transition-colors duration-200 px-1.5 py-1 -my-1"
                >
                  Delete
                </button>
              ) : (
                <>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-[12px] text-rose-400/70 hover:text-rose-400 transition-colors duration-200 px-1.5 py-1 -my-1"
                  >
                    {deleting ? "..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setShowDelete(false)}
                    className="text-[12px] text-txt-tertiary transition-colors duration-200 px-1.5 py-1 -my-1"
                  >
                    Cancel
                  </button>
                </>
              )}
            </span>
          )}
        </div>

        {/* Body or edit form */}
        {editing ? (
          <div className="space-y-2 ml-7">
            <textarea
              id={`edit-comment-${comment.id}`}
              name={`edit-comment-${comment.id}`}
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={3}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-txt-primary focus:outline-none focus:border-[rgba(255,255,255,0.2)] focus:ring-1 focus:ring-[rgba(255,255,255,0.08)] resize-y transition-all duration-200"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-[12px] text-white bg-emerald-500/90 hover:bg-emerald-500 px-3 py-1.5 rounded-lg disabled:opacity-40 transition-all duration-200 font-medium"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => { setEditing(false); setEditBody(comment.body); }}
                className="text-[12px] text-txt-tertiary hover:text-txt-secondary px-3 py-1.5 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="ml-7">
            {comment.body.length > 300 ? (
              <ExpandableText
                text={comment.body}
                limit={300}
                className="text-sm leading-relaxed text-[rgba(255,255,255,0.65)]"
              />
            ) : (
              <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-1 text-[rgba(255,255,255,0.65)]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {comment.body}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Like + Reply actions */}
        {!editing && (
          <div className="flex items-center gap-3 mt-1.5 ml-7">
            <button
              onClick={handleLike}
              disabled={!userId}
              className={`flex items-center gap-1 text-[12px] py-1.5 transition-colors duration-200 ${
                liked
                  ? "text-emerald-400"
                  : "text-zinc-500 hover:text-emerald-400"
              } disabled:opacity-30 disabled:cursor-default`}
            >
              <svg className="w-3.5 h-3.5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zm-9 11H3a1 1 0 01-1-1v-7a1 1 0 011-1h2" />
              </svg>
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>

            {userId && (
              <button
                onClick={() => setReplying(!replying)}
                className="text-zinc-500 hover:text-zinc-300 text-[12px] py-1.5 transition-colors duration-200"
              >
                Reply
              </button>
            )}
          </div>
        )}

        {/* Inline reply form */}
        {replying && (
          <form onSubmit={handleReplySubmit} className="flex gap-2 items-center mt-2.5 ml-7">
            <input
              type="text"
              placeholder="Write a reply..."
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-1.5 text-sm text-txt-primary placeholder-[rgba(255,255,255,0.25)] focus:outline-none focus:border-[rgba(255,255,255,0.15)] focus:ring-1 focus:ring-[rgba(255,255,255,0.06)] transition-all duration-200"
              autoFocus
            />
            <button
              type="submit"
              disabled={replySubmitting || !replyBody.trim()}
              className="text-[12px] px-3 py-1.5 rounded-lg disabled:opacity-40 shrink-0 text-white bg-emerald-500/90 hover:bg-emerald-500 font-medium transition-all duration-200"
            >
              {replySubmitting ? "..." : "Reply"}
            </button>
            <button
              type="button"
              onClick={() => { setReplying(false); setReplyBody(""); }}
              className="text-[12px] text-txt-tertiary hover:text-txt-secondary transition-colors duration-200"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* Render replies with threading line */}
      {comment.replies.length > 0 && (
        <div className="ml-7 pl-4 relative">
          {/* Vertical connecting line */}
          <div className="absolute left-0 top-0 bottom-2 w-px bg-[rgba(255,255,255,0.08)]" />
          {comment.replies.map((reply) => (
            <div key={reply.id} className="relative">
              {/* Horizontal branch connector */}
              <div className="absolute left-0 top-5 w-3 h-px bg-[rgba(255,255,255,0.08)]" style={{ marginLeft: "-16px" }} />
              <CommentItem
                comment={reply}
                userId={userId}
                isAdmin={isAdmin}
                depth={depth + 1}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onLikeToggle={onLikeToggle}
                onReply={onReply}
                variant={variant}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
