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
  const isSession = variant === "session";

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
    <div>
      <div
        className={
          isSession
            ? "border-l-2 border-[rgba(255,255,255,0.06)] pl-3 py-2.5 hover:border-[rgba(255,255,255,0.12)] transition-all duration-200"
            : "border-l-2 border-[rgba(255,255,255,0.06)] pl-3 py-2"
        }
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Header */}
        <div className="flex items-center gap-2 text-[13px] text-txt-tertiary mb-1">
          <span className={isSession ? "text-[rgba(255,255,255,0.6)]" : undefined}>
            {comment.profiles?.username ?? "Unknown"}
          </span>
          {comment.profiles && <RoleBadge role={comment.profiles.role} />}
          <span>&middot;</span>
          <TimeAgo date={comment.created_at} />
          {canEdit && hovered && !editing && (
            <span className="ml-auto flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className={`text-[12px] text-txt-tertiary hover:text-txt-secondary${isSession ? " transition-colors duration-200" : ""}`}
              >
                Edit
              </button>
              {!showDelete ? (
                <button
                  onClick={() => setShowDelete(true)}
                  className={`text-[12px] text-txt-tertiary hover:text-txt-secondary${isSession ? " transition-colors duration-200" : ""}`}
                >
                  Delete
                </button>
              ) : (
                <>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className={`text-[12px] text-txt-tertiary hover:text-white${isSession ? " transition-colors duration-200" : ""}`}
                  >
                    {deleting ? "..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setShowDelete(false)}
                    className={`text-[12px] text-txt-tertiary${isSession ? " transition-colors duration-200" : ""}`}
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
          <div className="space-y-2">
            <textarea
              id={`edit-comment-${comment.id}`}
              name={`edit-comment-${comment.id}`}
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={3}
              className={
                isSession
                  ? "w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-txt-primary focus:outline-none focus:border-[rgba(255,255,255,0.2)] focus:ring-1 focus:ring-[rgba(255,255,255,0.08)] resize-y transition-all duration-200"
                  : "w-full bg-transparent border border-[rgba(255,255,255,0.1)] rounded-md px-3 py-2 text-sm text-txt-primary focus:outline-none focus:border-[rgba(255,255,255,0.25)] resize-y"
              }
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className={
                  isSession
                    ? "text-[13px] text-white bg-emerald-500/90 hover:bg-emerald-500 px-3 py-1 rounded-lg disabled:opacity-40 transition-all duration-200"
                    : "text-[13px] text-white bg-[rgba(255,255,255,0.1)] px-3 py-1 rounded-md disabled:opacity-40"
                }
              >
                {saving ? (isSession ? "Saving..." : "...") : "Save"}
              </button>
              <button
                onClick={() => { setEditing(false); setEditBody(comment.body); }}
                className={`text-[13px] text-txt-tertiary px-3 py-1${isSession ? " hover:text-txt-secondary transition-colors duration-200" : ""}`}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : comment.body.length > 300 ? (
          <ExpandableText
            text={comment.body}
            limit={300}
            className={`text-sm leading-relaxed ${
              isSession ? "text-[rgba(255,255,255,0.65)]" : "text-[rgba(255,255,255,0.7)]"
            }`}
          />
        ) : (
          <div className={`text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-1 ${
            isSession ? "text-[rgba(255,255,255,0.65)]" : "text-[rgba(255,255,255,0.7)]"
          }`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {comment.body}
            </ReactMarkdown>
          </div>
        )}

        {/* Like + Reply actions */}
        {!editing && (
          <div className="flex items-center gap-4 mt-1.5">
            <button
              onClick={handleLike}
              disabled={!userId}
              className={`flex items-center gap-1 text-[13px] transition-colors duration-200 ${
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
                className="text-zinc-500 hover:text-zinc-300 text-[13px] transition-colors duration-200"
              >
                Reply
              </button>
            )}
          </div>
        )}

        {/* Inline reply form */}
        {replying && (
          <form onSubmit={handleReplySubmit} className="flex gap-2 items-center mt-2">
            <input
              type="text"
              placeholder="Write a reply..."
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              className={
                isSession
                  ? "flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-1.5 text-sm text-txt-primary placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(255,255,255,0.15)] focus:ring-1 focus:ring-[rgba(255,255,255,0.06)] transition-all duration-200"
                  : "flex-1 bg-transparent border-b border-dark-border py-1.5 text-sm text-txt-primary placeholder-txt-tertiary focus:outline-none focus:border-[rgba(255,255,255,0.25)]"
              }
              autoFocus
            />
            <button
              type="submit"
              disabled={replySubmitting || !replyBody.trim()}
              className={`text-[13px] px-3 py-1 rounded-md disabled:opacity-40 shrink-0 ${
                isSession
                  ? "text-white bg-emerald-500/90 hover:bg-emerald-500 rounded-lg"
                  : "text-white bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)]"
              }`}
            >
              {replySubmitting ? "..." : "Reply"}
            </button>
            <button
              type="button"
              onClick={() => { setReplying(false); setReplyBody(""); }}
              className="text-[13px] text-txt-tertiary"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* Render replies */}
      {comment.replies.length > 0 && (
        <div className="ml-6 pl-4 border-l-2 border-zinc-800">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
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
          ))}
        </div>
      )}
    </div>
  );
}
