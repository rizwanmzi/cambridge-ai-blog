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
          className="w-full text-left py-2.5 text-sm text-txt-tertiary hover:text-txt-secondary transition-colors"
        >
          Write something...
        </button>
      ) : (
        <div>
          <textarea
            id="quick-post"
            name="quick-post"
            autoFocus
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write something..."
            rows={4}
            className="w-full bg-transparent border border-[rgba(255,255,255,0.15)] rounded-md px-3 py-2.5 text-sm text-txt-primary placeholder-txt-tertiary focus:outline-none focus:border-[rgba(255,255,255,0.25)] resize-y font-mono leading-relaxed"
          />
          {message && (
            <p className={`text-[13px] mt-2 ${message.type === "success" ? "text-green-400/70" : "text-txt-tertiary"}`}>
              {message.text}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] text-txt-tertiary">AI will categorise</p>
            <div className="flex gap-2">
              <button
                onClick={() => { setExpanded(false); setBody(""); setMessage(null); }}
                className="text-[13px] text-txt-tertiary hover:text-txt-secondary transition-colors px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={posting || !body.trim()}
                className="text-[13px] text-white bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] px-3 py-1.5 rounded-md transition-colors disabled:opacity-40"
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
