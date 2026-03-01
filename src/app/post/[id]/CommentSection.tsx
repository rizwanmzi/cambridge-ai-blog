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

export default function CommentSection({
  postId,
  initialComments,
}: {
  postId: number;
  initialComments: Comment[];
}) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      setError(
        err instanceof Error ? err.message : "Failed to post comment."
      );
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
            <div key={comment.id} className="bg-dark-surface rounded-xl p-4 border border-dark-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-txt-primary text-sm">
                  {comment.profiles?.username ?? "Unknown"}
                </span>
                {comment.profiles && (
                  <RoleBadge role={comment.profiles.role} />
                )}
                <span className="text-txt-secondary/60 text-xs">
                  {new Date(comment.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-txt-secondary text-sm leading-relaxed">
                {comment.body}
              </p>
            </div>
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
