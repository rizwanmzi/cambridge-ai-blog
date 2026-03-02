"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { canPost } from "@/lib/roles";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { label: "Live Insight", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  { label: "Formal Notes", color: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  { label: "Key Takeaway", color: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  { label: "Reflection", color: "bg-purple-500/15 text-purple-400 border-purple-500/25" },
];

export default function QuickPostBar({ sessionId }: { sessionId: number }) {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const composerRef = useRef<HTMLDivElement>(null);

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
    <div ref={composerRef} id="post-composer" className="mb-6">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full text-left px-4 py-4 min-h-[60px] flex items-center text-sm text-zinc-400 bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-zinc-600 hover:text-zinc-300 transition-all duration-200"
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
            rows={5}
            className="w-full min-h-[120px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2.5 text-sm text-txt-primary placeholder-zinc-400 focus:outline-none focus:border-[rgba(255,255,255,0.15)] focus:ring-1 focus:ring-[rgba(255,255,255,0.08)] resize-y font-mono leading-relaxed transition-all duration-200"
          />
          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {CATEGORIES.map((cat) => (
              <span
                key={cat.label}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${cat.color}`}
              >
                {cat.label}
              </span>
            ))}
            <span className="text-[11px] text-txt-tertiary self-center ml-1">— AI picks the best fit</span>
          </div>
          {message && (
            <p className={`text-[13px] mt-2 ${message.type === "success" ? "text-emerald-400/80" : "text-txt-tertiary"}`}>
              {message.text}
            </p>
          )}
          <div className="flex items-center justify-end mt-3 gap-2">
            <button
              onClick={() => { setExpanded(false); setBody(""); setMessage(null); }}
              className="text-[13px] text-txt-tertiary hover:text-txt-secondary transition-all duration-200 px-3 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handlePost}
              disabled={posting || !body.trim()}
              className="text-sm text-white bg-emerald-600 hover:bg-emerald-500 font-medium rounded-lg px-4 py-2 transition-all duration-200 disabled:opacity-40"
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
