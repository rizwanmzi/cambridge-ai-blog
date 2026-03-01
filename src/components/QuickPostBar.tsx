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
        body: JSON.stringify({
          session_id: sessionId,
          body: body.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post");
      }

      setBody("");
      setExpanded(false);
      setMessage({ type: "success", text: "Posted! Refreshing..." });
      setTimeout(() => router.refresh(), 500);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to post" });
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="mb-6">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full text-left px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-txt-secondary/60 hover:border-accent/30 hover:text-txt-secondary transition-all"
        >
          Share an insight from this session...
        </button>
      ) : (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
          <textarea
            autoFocus
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share an insight from this session..."
            rows={4}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-sm text-txt-primary placeholder-txt-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-y font-mono leading-relaxed"
          />
          {message && (
            <p className={`text-sm mt-2 ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {message.text}
            </p>
          )}
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-txt-secondary/50">
              Title auto-generated. AI will categorise.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setExpanded(false); setBody(""); setMessage(null); }}
                className="px-4 py-2 text-sm text-txt-secondary border border-dark-border rounded-lg hover:border-txt-secondary/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={posting || !body.trim()}
                className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
