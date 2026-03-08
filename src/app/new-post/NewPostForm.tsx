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
        if (!preselectedSession && data.length > 0) {
          const now = new Date();
          const londonStr = now.toLocaleString("en-GB", { timeZone: "Europe/London" });
          const [datePart, timePart] = londonStr.split(", ");
          const [day, month, year] = datePart.split("/");
          const londonNow = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${timePart}+00:00`);

          const live = data.find((s) => {
            const start = new Date(`${s.session_date}T${s.start_time}+00:00`);
            const end = new Date(`${s.session_date}T${s.end_time}+00:00`);
            return londonNow >= start && londonNow <= end;
          });
          if (live) {
            setSessionId(String(live.id));
            return;
          }

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
    return <p className="text-sm text-txt-tertiary py-16 text-center">Loading...</p>;
  }

  if (!profile || !canPost(profile.role)) {
    return (
      <div className="text-center py-16">
        <h1 className="text-lg font-semibold text-white mb-2">Access Denied</h1>
        <p className="text-sm text-txt-tertiary">Only Admins and Attendees can create posts.</p>
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

  const inputClass = "w-full px-3 py-2.5 bg-dark-surface border border-[rgba(255,255,255,0.1)] rounded-md text-sm text-txt-primary placeholder-txt-tertiary focus:outline-none focus:border-[rgba(255,255,255,0.25)]";

  return (
    <div className="max-w-[720px] mx-auto">
      <h1 className="text-lg font-semibold text-white mb-1">New Post</h1>
      <p className="text-[13px] text-txt-tertiary mb-6">
        Write in Markdown. AI will categorise your post automatically.
      </p>

      <form onSubmit={handlePublish} className="space-y-4">
        <div>
          <label htmlFor="session" className="block text-[13px] text-txt-secondary mb-1.5">Session</label>
          <select
            id="session"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            required
            className={inputClass}
          >
            <option value="" disabled>Select a session...</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                Day {s.day_number}: {s.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-[13px] text-txt-secondary mb-1.5">
            Title <span className="text-txt-tertiary">(optional)</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="Auto-generated if blank"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-[13px] text-txt-secondary mb-1.5">
            Body <span className="text-txt-tertiary">(Markdown)</span>
          </label>
          <textarea
            id="body"
            placeholder="Write your post..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={12}
            className={`${inputClass} resize-y font-mono leading-relaxed`}
          />
        </div>

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-green-400" : "text-txt-tertiary"}`}>
            {message.text}
          </p>
        )}

        {/* Desktop */}
        <button
          type="submit"
          disabled={publishing}
          className="hidden sm:inline-block bg-white text-black px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[rgba(255,255,255,0.9)] transition-colors disabled:opacity-50"
        >
          {publishing ? "Publishing..." : "Publish Post"}
        </button>
      </form>

      {/* Mobile sticky */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-dark-bg/95 backdrop-blur border-t border-[rgba(255,255,255,0.06)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => {
            const form = document.querySelector("form");
            if (form) form.requestSubmit();
          }}
          disabled={publishing}
          className="w-full bg-white text-black py-3 rounded-md text-sm font-medium hover:bg-[rgba(255,255,255,0.9)] transition-colors disabled:opacity-50"
        >
          {publishing ? "Publishing..." : "Publish Post"}
        </button>
      </div>

      <div className="sm:hidden h-20" />
    </div>
  );
}
