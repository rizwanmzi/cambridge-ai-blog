"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { canPost } from "@/lib/roles";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Live Insight",
  "Formal Notes",
  "Key Takeaway",
  "Reflection",
];

export default function NewPostPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [body, setBody] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-navy-400">Loading...</p>
      </div>
    );
  }

  if (!profile || !canPost(profile.role)) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-navy-900 mb-4">
          Access Denied
        </h1>
        <p className="text-navy-500">
          Only Admins and Attendees can create posts.
        </p>
      </div>
    );
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setPublishing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          category,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to publish");
      }

      const post = await res.json();
      setMessage({ type: "success", text: "Post published!" });
      setTitle("");
      setBody("");
      setCategory(CATEGORIES[0]);

      // Redirect to the new post after a brief moment
      setTimeout(() => router.push(`/post/${post.id}`), 800);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to publish post.",
      });
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">New Post</h1>
      <p className="text-navy-400 text-sm mb-8">
        Write in Markdown. Publish from anywhere.
      </p>

      <form onSubmit={handlePublish} className="space-y-5">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-navy-700 mb-1.5"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-navy-700 mb-1.5"
          >
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-transparent"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="body"
            className="block text-sm font-medium text-navy-700 mb-1.5"
          >
            Body{" "}
            <span className="font-normal text-navy-400">
              (Markdown supported)
            </span>
          </label>
          <textarea
            id="body"
            placeholder="Write your post here...

## Supports Markdown

- Bullet points
- **Bold text**
- *Italic text*

> Blockquotes too"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={12}
            className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-transparent resize-y font-mono text-sm leading-relaxed"
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={publishing}
          className="w-full sm:w-auto bg-navy-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-navy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
        >
          {publishing ? "Publishing..." : "Publish Post"}
        </button>
      </form>
    </div>
  );
}
