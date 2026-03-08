"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const dayNames: Record<number, string> = {
  0: "Sunday", 1: "Monday", 2: "Tuesday",
  3: "Wednesday", 4: "Thursday", 5: "Friday",
};

const dayDates: Record<number, string> = {
  0: "1 March 2026", 1: "2 March 2026", 2: "3 March 2026",
  3: "4 March 2026", 4: "5 March 2026", 5: "6 March 2026",
};

export default function GenerateSummaryButton({ dayNumber }: { dayNumber: number }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (profile?.role !== "Admin") return null;

  const handleGenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowser();

      // Fetch sessions for this day
      const { data: sessions } = await supabase
        .from("sessions")
        .select("id, title, faculty, start_time, end_time, is_social")
        .eq("day_number", dayNumber)
        .order("start_time");

      const nonSocialSessions = (sessions || []).filter((s) => !s.is_social);
      const sessionIds = nonSocialSessions.map((s) => s.id);

      if (sessionIds.length === 0) {
        setError("No sessions for this day");
        setLoading(false);
        return;
      }

      // Fetch posts for these sessions
      const { data: posts } = await supabase
        .from("posts")
        .select("id, title, body, category, session_id, profiles(username, role)")
        .in("session_id", sessionIds)
        .order("created_at", { ascending: true });

      if (!posts || posts.length === 0) {
        setError("No posts yet for this day");
        setLoading(false);
        return;
      }

      const postIds = posts.map((p) => p.id);

      // Fetch comments for these posts
      const { data: comments } = await supabase
        .from("comments")
        .select("id, body, post_id, profiles(username, role)")
        .in("post_id", postIds)
        .order("created_at", { ascending: true });

      // Fetch cached AI summaries for sessions
      const { data: aiSummaries } = await supabase
        .from("ai_summaries")
        .select("session_id, content")
        .eq("scope", "session")
        .in("session_id", sessionIds)
        .eq("is_stale", false);

      // Build context string
      const sessionTitles = nonSocialSessions.map((s) => s.title);

      const postsContext = nonSocialSessions
        .map((session) => {
          const sessionPosts = (posts || []).filter((p) => p.session_id === session.id);
          const postsText = sessionPosts
            .map((p) => {
              const profile = p.profiles as unknown as { username: string; role: string } | null;
              const postComments = (comments || [])
                .filter((c) => c.post_id === p.id)
                .map((c) => {
                  const cp = c.profiles as unknown as { username: string; role: string } | null;
                  return `    Comment by ${cp?.username ?? "Unknown"}: ${c.body}`;
                })
                .join("\n");
              return `  [${p.category}] "${p.title}" by ${profile?.username ?? "Unknown"} (${profile?.role ?? "Unknown"}):\n  ${p.body}${postComments ? `\n  Comments:\n${postComments}` : ""}`;
            })
            .join("\n\n");
          return `SESSION: ${session.title} (${session.faculty || "N/A"}, ${session.start_time.slice(0, 5)}–${session.end_time.slice(0, 5)})\n${postsText || "  No posts."}`;
        })
        .join("\n\n---\n\n");

      // Call API for AI summary
      const res = await fetch("/api/ai/daily-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posts_context: postsContext,
          day_number: dayNumber,
          day_name: dayNames[dayNumber] || `Day ${dayNumber}`,
          session_titles: sessionTitles,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate summary");

      // Build session data for PDF
      const summaryMap = new Map<number, { themes: { title: string }[] }>();
      (aiSummaries || []).forEach((s) => {
        if (s.session_id != null) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          summaryMap.set(s.session_id, s.content as any);
        }
      });

      const sessionsForPdf = nonSocialSessions.map((session) => {
        const sessionPosts = (posts || []).filter((p) => p.session_id === session.id);
        const cached = summaryMap.get(session.id);
        return {
          title: session.title,
          faculty: session.faculty,
          start_time: session.start_time,
          end_time: session.end_time,
          posts: sessionPosts.map((p) => {
            const profile = p.profiles as unknown as { username: string; role: string } | null;
            return {
              title: p.title,
              body: p.body,
              category: p.category,
              author: profile?.username ?? "Unknown",
              role: profile?.role ?? "Unknown",
            };
          }),
          themes: cached?.themes?.map((t) => t.title) || [],
        };
      });

      // Dynamically import PDF components (heavy, only load when needed)
      const [{ pdf }, { default: DailySummaryPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/DailySummaryPDF"),
      ]);

      const blob = await pdf(
        <DailySummaryPDF
          dayNumber={dayNumber}
          dayName={dayNames[dayNumber] || `Day ${dayNumber}`}
          date={dayDates[dayNumber] || ""}
          executiveNarrative={data.executive_narrative}
          crossCuttingThemes={data.cross_cutting_themes || []}
          openQuestions={data.open_questions || []}
          sessionHighlights={data.session_highlights || []}
          sessions={sessionsForPdf}
          generatedAt={new Date().toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        />
      ).toBlob();

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStr = dayDates[dayNumber]?.replace(/ /g, "_") || dayNumber.toString();
      a.download = `Cambridge_AI_Day_${dayNumber}_Summary_${dateStr}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-1.5 bg-copper-500 hover:bg-copper-400 text-white text-[11px] font-medium rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
        title="Generate daily summary PDF"
      >
        {loading ? (
          <>
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>PDF</span>
          </>
        )}
      </button>
      {error && (
        <span className="text-[11px] text-red-400">{error}</span>
      )}
    </div>
  );
}
