"use client";

import { useState } from "react";

interface Comment {
  id: number;
  post_id: number;
  author_name: string;
  body: string;
  created_at: string;
}

export default function CommentSection({
  postId,
  initialComments,
}: {
  postId: number;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          author_name: name.trim(),
          body: body.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to post comment");
      }

      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setName("");
      setBody("");
    } catch {
      setError("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-navy-900 mb-6">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="space-y-4 mb-8">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-navy-50 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-navy-800 text-sm">
                  {comment.author_name}
                </span>
                <span className="text-navy-300 text-xs">
                  {new Date(comment.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-navy-700 text-sm leading-relaxed">
                {comment.body}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-navy-400 text-sm mb-8">
          No comments yet. Be the first to share your thoughts.
        </p>
      )}

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-sm font-medium text-navy-700">Leave a comment</h3>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-sm text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-transparent"
        />
        <textarea
          placeholder="Your comment..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={3}
          className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-sm text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-transparent resize-y"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-navy-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-navy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </form>
    </section>
  );
}
