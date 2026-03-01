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
  start_time: string;
  end_time: string;
  session_date: string;
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
        .select("id, day_number, title, start_time, end_time, session_date")
        .eq("is_social", false)
        .order("day_number")
        .order("start_time");
      if (data) {
        setSessions(data);
        // Auto-select live or next upcoming session if no preselected
        if (!preselectedSession && data.length > 0) {
          const now = new Date();
          const londonStr = now.toLocaleString("en-GB", { timeZone: "Europe/London" });
          const [datePart, timePart] = londonStr.split(", ");
          const [day, month, year] = datePart.split("/");
          const londonNow = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${timePart}+00:00`);

          // Find live session
          const live = data.find((s) => {
            const start = new Date(`${s.session_date}T${s.start_time}+00:00`);
            const end = new Date(`${s.session_date}T${s.end_time}+00:00`);
            return londonNow >= start && londonNow <= end;
          });
          if (live) {
            setSessionId(String(live.id));
            return;
          }

          // Find next upcoming
          const upcoming = data
            .filter((s) => new Date(`${s.session_date}T${s.start_time}+00:00`) > londonNow)
            .sort((a, b) =>
              new Date(`${a.session_date}T${a.start_time}+00:00`).getTime() -
              new Date(`${b.session_date}T${b.start_time}+00:00`).getTime()
            );
          if (upcoming.length > 0) {
            setSessionId(String(upcoming[0].id));
          }
        }
      }
    }
    loadSessions();
  }, [preselectedSession]);

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

  const inputClasses = "w-full px-4 py-2.5 bg-dark-surface border border-[rgba(255,255,255,0.06)] rounded-lg text-txt-primary placeholder-txt-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";
  const selectClasses = "w-full px-4 py-2.5 bg-dark-surface border border-[rgba(255,255,255,0.06)] rounded-lg text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-1">New Post</h1>
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
            Title{" "}
            <span className="font-normal text-txt-secondary/60">(optional — auto-generated if blank)</span>
          </label>
          <input id="title" type="text" placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClasses} />
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

        {/* Desktop button */}
        <button
          type="submit"
          disabled={publishing}
          className="hidden sm:inline-block bg-accent text-white px-8 py-3 rounded-lg font-medium hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
        >
          {publishing ? "Publishing..." : "Publish Post"}
        </button>
      </form>

      {/* Mobile sticky button */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-dark-bg/90 backdrop-blur border-t border-[rgba(255,255,255,0.06)] p-4">
        <button
          type="button"
          onClick={() => {
            const form = document.querySelector("form");
            if (form) form.requestSubmit();
          }}
          disabled={publishing}
          className="w-full bg-accent text-white py-3.5 rounded-lg font-medium hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
        >
          {publishing ? "Publishing..." : "Publish Post"}
        </button>
      </div>

      {/* Spacer for mobile sticky button */}
      <div className="sm:hidden h-20" />
    </div>
  );
}
