"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import RoleBadge from "@/components/RoleBadge";

interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  body: string;
  created_at: string;
  profiles: {
    username: string;
    role: string;
  };
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canEdit = userId === comment.user_id || isAdmin;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editBody.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      onUpdate(comment.id, updated.body);
      setEditing(false);
    } catch {
      // keep editing open
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      onDelete(comment.id);
    } catch {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="bg-dark-surface rounded-xl p-4 border border-dark-border">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-medium text-txt-primary text-sm">
          {comment.profiles?.username ?? "Unknown"}
        </span>
        {comment.profiles && <RoleBadge role={comment.profiles.role} />}
        <span className="text-txt-secondary/60 text-xs">
          {new Date(comment.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        {canEdit && !editing && (
          <span className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-txt-secondary/60 hover:text-accent transition-colors"
            >
              Edit
            </button>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-txt-secondary/60 hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            ) : (
              <>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs text-red-400 font-medium hover:text-red-300 disabled:opacity-50"
                >
                  {deleting ? "..." : "Confirm"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs text-txt-secondary/60 hover:text-txt-primary"
                >
                  Cancel
                </button>
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
            className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-y"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setEditBody(comment.body);
              }}
              className="text-xs text-txt-secondary px-3 py-1.5 rounded-lg border border-dark-border hover:border-txt-secondary/50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-txt-secondary text-sm leading-relaxed">{comment.body}</p>
      )}
    </div>
  );
}

export default function CommentSection({
  postId,
  initialComments,
}: {
  postId: number;
  initialComments: Comment[];
}) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = profile?.role === "Admin";

  function handleUpdate(id: number, newBody: string) {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, body: newBody } : c))
    );
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
        body: JSON.stringify({
          post_id: postId,
          body: body.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post comment");
      }

      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-txt-primary mb-6">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      {comments.length > 0 ? (
        <div className="space-y-4 mb-8">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              userId={user?.id}
              isAdmin={isAdmin}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <p className="text-txt-secondary text-sm mb-8">
          No comments yet. Be the first to share your thoughts.
        </p>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-sm font-medium text-txt-secondary">
            Leave a comment
          </h3>
          <textarea
            placeholder="Your comment..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={3}
            className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-lg text-sm text-txt-primary placeholder-txt-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-y"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="text-txt-secondary text-sm">Sign in to leave a comment.</p>
      )}
    </section>
  );
}
