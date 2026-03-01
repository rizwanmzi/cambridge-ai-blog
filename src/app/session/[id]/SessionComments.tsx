"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import RoleBadge from "@/components/RoleBadge";
import TimeAgo from "@/components/TimeAgo";

interface Comment {
  id: number;
  session_id: number;
  user_id: string;
  body: string;
  created_at: string;
  profiles: { username: string; role: string };
}

function CommentItem({
  comment,
  userId,
  isAdmin,
  onUpdate,
  onDelete,
}: {
  comment: Comment;
  userId: string | undefined;
  isAdmin: boolean;
  onUpdate: (id: number, body: string) => void;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const canEdit = userId === comment.user_id || isAdmin;

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

  return (
    <div
      className="border-l-2 border-[rgba(255,255,255,0.06)] pl-3 py-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-2 text-[13px] text-txt-tertiary mb-1">
        <span>{comment.profiles?.username ?? "Unknown"}</span>
        {comment.profiles && <RoleBadge role={comment.profiles.role} />}
        <span>&middot;</span>
        <TimeAgo date={comment.created_at} />
        {canEdit && hovered && !editing && (
          <span className="ml-auto flex gap-2">
            <button onClick={() => setEditing(true)} className="text-[12px] text-txt-tertiary hover:text-txt-secondary">Edit</button>
            {!showDelete ? (
              <button onClick={() => setShowDelete(true)} className="text-[12px] text-txt-tertiary hover:text-txt-secondary">Delete</button>
            ) : (
              <>
                <button onClick={handleDelete} disabled={deleting} className="text-[12px] text-txt-tertiary hover:text-white">{deleting ? "..." : "Confirm"}</button>
                <button onClick={() => setShowDelete(false)} className="text-[12px] text-txt-tertiary">Cancel</button>
              </>
            )}
          </span>
        )}
      </div>
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={3}
            className="w-full bg-transparent border border-[rgba(255,255,255,0.1)] rounded-md px-3 py-2 text-sm text-txt-primary focus:outline-none focus:border-[rgba(255,255,255,0.25)] resize-y"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="text-[13px] text-white bg-[rgba(255,255,255,0.1)] px-3 py-1 rounded-md disabled:opacity-40">{saving ? "Saving..." : "Save"}</button>
            <button onClick={() => { setEditing(false); setEditBody(comment.body); }} className="text-[13px] text-txt-tertiary px-3 py-1">Cancel</button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[rgba(255,255,255,0.7)] leading-relaxed">{comment.body}</p>
      )}
    </div>
  );
}

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

  function handleUpdate(id: number, newBody: string) {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, body: newBody } : c)));
  }
  function handleDelete(id: number) {
    setComments((prev) => prev.filter((c) => c.id !== id));
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
      setComments((prev) => [...prev, newComment]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2 className="text-[12px] uppercase tracking-wider text-txt-tertiary mb-4">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      {comments.length > 0 ? (
        <div className="space-y-1 mb-6">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} userId={user?.id} isAdmin={isAdmin} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-txt-tertiary mb-6">No comments yet.</p>
      )}

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2 items-start">
          <input
            type="text"
            placeholder="Add a comment..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            className="flex-1 bg-transparent border-b border-[rgba(255,255,255,0.08)] focus:border-[rgba(255,255,255,0.25)] py-2 text-sm text-txt-primary placeholder-txt-tertiary focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="text-[13px] text-white bg-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-md hover:bg-[rgba(255,255,255,0.15)] disabled:opacity-40 shrink-0"
          >
            {submitting ? "..." : "Post"}
          </button>
          {error && <p className="text-sm text-txt-tertiary">{error}</p>}
        </form>
      )}
    </section>
  );
}
