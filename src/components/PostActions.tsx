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

export default function PostActions({ postId, authorId, initialTitle, initialBody }: PostActionsProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  const canEdit = user?.id === authorId || profile?.role === "Admin";
  if (!canEdit) return null;

  async function handleSave() {
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setEditing(false);
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      router.push("/");
    } catch (err) { setError(err instanceof Error ? err.message : "Failed"); setDeleting(false); setShowDeleteConfirm(false); }
  }

  if (editing) {
    return (
      <div className="mb-6 space-y-3">
        <input id="edit-post-title" name="edit-post-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent border border-[rgba(255,255,255,0.1)] rounded-md px-3 py-2 text-sm text-txt-primary focus:outline-none focus:border-[rgba(255,255,255,0.25)]" />
        <textarea id="edit-post-body" name="edit-post-body" value={body} onChange={(e) => setBody(e.target.value)} rows={10}
          className="w-full bg-transparent border border-[rgba(255,255,255,0.1)] rounded-md px-3 py-2 text-sm text-txt-primary font-mono focus:outline-none focus:border-[rgba(255,255,255,0.25)] resize-y" />
        {error && <p className="text-sm text-txt-tertiary">{error}</p>}
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving}
            className="text-[13px] text-white bg-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-md disabled:opacity-40">{saving ? "Saving..." : "Save"}</button>
          <button onClick={() => { setEditing(false); setTitle(initialTitle); setBody(initialBody); setError(""); }}
            className="text-[13px] text-txt-tertiary px-3 py-1.5">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 mb-4 text-[13px]">
      <button onClick={() => setEditing(true)} className="text-txt-tertiary hover:text-txt-secondary">Edit</button>
      {!showDeleteConfirm ? (
        <button onClick={() => setShowDeleteConfirm(true)} className="text-txt-tertiary hover:text-txt-secondary">Delete</button>
      ) : (
        <>
          <span className="text-txt-tertiary">Are you sure?</span>
          <button onClick={handleDelete} disabled={deleting} className="text-txt-tertiary hover:text-white">{deleting ? "..." : "Yes, delete"}</button>
          <button onClick={() => setShowDeleteConfirm(false)} className="text-txt-tertiary">Cancel</button>
        </>
      )}
      {error && <span className="text-txt-tertiary">{error}</span>}
    </div>
  );
}
