"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface PostActionsProps {
  postId: number;
  authorId: string;
  initialTitle: string;
  initialBody: string;
}

export default function PostActions({
  postId,
  authorId,
  initialTitle,
  initialBody,
}: PostActionsProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  const isOwner = user?.id === authorId;
  const isAdmin = profile?.role === "Admin";
  const canEdit = isOwner || isAdmin;

  if (!canEdit) return null;

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  if (editing) {
    return (
      <div className="mb-8 bg-dark-surface border border-dark-border rounded-xl p-6">
        <h3 className="text-sm font-medium text-txt-secondary mb-4">Edit Post</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-txt-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-y"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setTitle(initialTitle);
                setBody(initialBody);
                setError("");
              }}
              className="px-5 py-2 rounded-lg text-sm font-medium text-txt-secondary border border-dark-border hover:border-txt-secondary/50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={() => setEditing(true)}
        className="text-sm text-txt-secondary hover:text-accent transition-colors"
      >
        Edit
      </button>
      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-sm text-txt-secondary hover:text-red-400 transition-colors"
        >
          Delete
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-red-400">Are you sure? This cannot be undone.</span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-400 font-medium hover:text-red-300 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Yes, delete"}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="text-sm text-txt-secondary hover:text-txt-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
