"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { canPost } from "@/lib/roles";
import { useRouter } from "next/navigation";

export default function QuickPostBar({ sessionId }: { sessionId: number }) {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (loading || !profile || !canPost(profile.role)) return null;

  async function handlePost() {
    if (!body.trim()) return;
    setPosting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, body: body.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post");
      }
      setBody("");
      setExpanded(false);
      setMessage({ type: "success", text: "Posted!" });
      setTimeout(() => router.refresh(), 500);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to post" });
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="mb-6 hidden sm:block">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full text-left px-4 py-3 text-sm text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.6)] bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[rgba(255,255,255,0.1)] transition-all duration-200"
        >
          Write something...
        </button>
      ) : (
        <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-4 transition-all duration-200">
          <textarea
            id="quick-post"
            name="quick-post"
            autoFocus
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share an insight, reflection, or note..."
            rows={4}
            className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2.5 text-sm text-txt-primary placeholder-[rgba(255,255,255,0.35)] focus:outline-none focus:border-[rgba(255,255,255,0.15)] focus:ring-1 focus:ring-[rgba(255,255,255,0.08)] resize-y font-mono leading-relaxed transition-all duration-200"
          />
          {message && (
            <p className={`text-[13px] mt-2 ${message.type === "success" ? "text-emerald-400/80" : "text-txt-tertiary"}`}>
              {message.text}
            </p>
          )}
          <div className="flex items-center justify-between mt-3">
            <p className="text-[11px] text-txt-tertiary">AI will categorise your post</p>
            <div className="flex gap-2">
              <button
                onClick={() => { setExpanded(false); setBody(""); setMessage(null); }}
                className="text-[13px] text-txt-tertiary hover:text-txt-secondary transition-all duration-200 px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={posting || !body.trim()}
                className="text-[13px] text-white bg-emerald-500/90 hover:bg-emerald-500 px-4 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-40 font-medium"
              >
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
