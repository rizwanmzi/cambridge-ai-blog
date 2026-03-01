"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { canPost } from "@/lib/roles";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useRouter, useSearchParams } from "next/navigation";

interface Session {
  id: number;
  day_number: number;
  title: string;
}

export default function NewPostForm() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSession = searchParams.get("session");

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState(preselectedSession || "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function loadSessions() {
      const supabase = createSupabaseBrowser();
      const { data } = await supabase
        .from("sessions")
        .select("id, day_number, title")
        .eq("is_social", false)
        .order("day_number")
        .order("start_time");
      if (data) setSessions(data);
    }
    loadSessions();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-txt-secondary">Loading...</p>
      </div>
    );
  }

  if (!profile || !canPost(profile.role)) {
    return (
      <div className="text-center py-16">
        <h1 className="font-heading text-2xl font-bold text-txt-primary mb-4">
          Access Denied
        </h1>
        <p className="text-txt-secondary">
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
          session_id: Number(sessionId),
          title: title.trim(),
          body: body.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to publish");
      }

      const post = await res.json();
      setMessage({ type: "success", text: "Post published! AI is categorising it..." });
      setTitle("");
      setBody("");

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

  const inputClasses = "w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-lg text-txt-primary placeholder-txt-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";
  const selectClasses = "w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-lg text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-txt-primary mb-1">New Post</h1>
      <p className="text-txt-secondary text-sm mb-8">
        Write in Markdown. AI will automatically categorise your post.
      </p>

      <form onSubmit={handlePublish} className="space-y-5">
        <div>
          <label htmlFor="session" className="block text-sm font-medium text-txt-secondary mb-1.5">
            Session
          </label>
          <select id="session" value={sessionId} onChange={(e) => setSessionId(e.target.value)} required className={selectClasses}>
            <option value="" disabled>Select a session...</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                Day {s.day_number}: {s.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-txt-secondary mb-1.5">
            Title
          </label>
          <input id="title" type="text" placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClasses} />
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-txt-secondary mb-1.5">
            Body{" "}
            <span className="font-normal text-txt-secondary/60">(Markdown supported)</span>
          </label>
          <textarea
            id="body"
            placeholder="Write your post here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={12}
            className={`${inputClasses} resize-y font-mono text-sm leading-relaxed`}
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm border ${
              message.type === "success"
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={publishing}
          className="w-full sm:w-auto bg-accent text-white px-8 py-3 rounded-lg font-medium hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
        >
          {publishing ? "Publishing..." : "Publish Post"}
        </button>
      </form>
    </div>
  );
}
