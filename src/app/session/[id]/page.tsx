import { createSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import RoleBadge from "@/components/RoleBadge";
import SessionComments from "./SessionComments";
import SessionTabs from "./SessionTabs";
import QuickPostBar from "@/components/QuickPostBar";
import ComposerFAB from "@/components/ComposerFAB";
import TimeAgo from "@/components/TimeAgo";

interface PostWithProfile {
  id: number;
  title: string;
  body: string;
  category: string;
  created_at: string;
  profiles: { username: string; role: string } | null;
}

const categoryBorderColor: Record<string, string> = {
  "Live Insight": "rgba(74,222,128,0.5)",
  "Formal Notes": "rgba(96,165,250,0.5)",
  "Key Takeaway": "rgba(251,191,36,0.5)",
  Reflection: "rgba(192,132,252,0.5)",
};

const categoryGlowColor: Record<string, string> = {
  "Live Insight": "rgba(74,222,128,0.08)",
  "Formal Notes": "rgba(96,165,250,0.08)",
  "Key Takeaway": "rgba(251,191,36,0.08)",
  Reflection: "rgba(192,132,252,0.08)",
};

const categoryPillClass: Record<string, string> = {
  "Live Insight": "cat-pill-live-insight",
  "Formal Notes": "cat-pill-formal-notes",
  "Key Takeaway": "cat-pill-key-takeaway",
  Reflection: "cat-pill-reflection",
};

function formatTime(t: string) {
  return t.slice(0, 5);
}

export const revalidate = 0;

export default async function SessionPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServer();

  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !session) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(username, role)")
    .eq("session_id", session.id)
    .order("created_at", { ascending: false });

  const { data: { user } } = await supabase.auth.getUser();

  const { data: rawComments } = await supabase
    .from("comments")
    .select("*, profiles(username, role)")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  // Photo count for the Photos tab badge
  const { count: photoCount } = await supabase
    .from("session_photos")
    .select("*", { count: "exact", head: true })
    .eq("session_id", session.id);

  let likedCommentIds = new Set<number>();
  if (user && rawComments && rawComments.length > 0) {
    const commentIds = rawComments.map((c: { id: number }) => c.id);
    const { data: likes } = await supabase
      .from("comment_likes")
      .select("comment_id")
      .eq("user_id", user.id)
      .in("comment_id", commentIds);
    if (likes) {
      likedCommentIds = new Set(likes.map((l: { comment_id: number }) => l.comment_id));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comments = (rawComments || []).map((c: any) => ({
    ...c,
    user_has_liked: likedCommentIds.has(c.id),
  }));

  const dayLabels: Record<number, string> = {
    0: "Sunday 1 March", 1: "Monday 2 March", 2: "Tuesday 3 March",
    3: "Wednesday 4 March", 4: "Thursday 5 March", 5: "Friday 6 March",
  };

  return (
    <div className="max-w-[720px] mx-auto relative">
      {/* Sticky session header */}
      <div className="sticky top-0 z-30 -mx-4 px-4 pt-3 pb-3 bg-dark-bg/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-all duration-200 shrink-0"
          >
            <svg className="w-4 h-4 text-txt-tertiary group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-[15px] font-semibold text-white truncate leading-tight">
              {session.title}
            </h1>
            <p className="text-[11px] text-txt-tertiary mt-0.5">
              {formatTime(session.start_time)}&ndash;{formatTime(session.end_time)}
              {session.faculty && <> &middot; {session.faculty}</>}
            </p>
          </div>
        </div>
      </div>

      {/* Session hero area */}
      <header className="mt-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-medium text-emerald-400/70 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/15">
            Day {session.day_number}
          </span>
          <span className="text-[12px] text-txt-tertiary">
            {dayLabels[session.day_number]}
          </span>
        </div>
        <h2 className="text-2xl font-semibold text-white leading-tight mb-2">
          {session.title}
        </h2>
        {session.description && (
          <p className="text-sm text-txt-secondary leading-relaxed">{session.description}</p>
        )}
      </header>

      {/* Post composer */}
      <QuickPostBar sessionId={session.id} />
      <ComposerFAB />

      {/* Posts + AI + Photos tabs in glass card */}
      <section className="mb-8 glass-panel overflow-hidden">
        <SessionTabs
          sessionId={session.id}
          photoCount={photoCount || 0}
          postsContent={
            <>
              {posts && posts.length > 0 ? (
                <div className="animate-fade-up">
                  {(posts as PostWithProfile[]).map((post, idx) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="block px-4 py-3.5 hover:bg-[rgba(255,255,255,0.03)] transition-all duration-200 group border-l-[3px]"
                      style={{
                        borderLeftColor: categoryBorderColor[post.category] || "transparent",
                        boxShadow: categoryGlowColor[post.category]
                          ? `inset 4px 0 12px ${categoryGlowColor[post.category]}`
                          : "none",
                        borderBottom: idx < (posts as PostWithProfile[]).length - 1
                          ? "1px solid rgba(255,255,255,0.04)"
                          : "none",
                      }}
                    >
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="text-sm text-[rgba(255,255,255,0.85)] group-hover:text-white transition-colors duration-200 truncate flex-1 font-medium">
                          {post.title}
                        </span>
                        <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${categoryPillClass[post.category] || "text-txt-tertiary bg-[rgba(255,255,255,0.05)]"}`}>
                          {post.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-txt-tertiary">
                        {post.profiles && (
                          <>
                            <span>{post.profiles.username}</span>
                            <RoleBadge role={post.profiles.role} />
                            <span className="text-[rgba(255,255,255,0.15)]">&middot;</span>
                          </>
                        )}
                        <TimeAgo date={post.created_at} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 animate-fade-up">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[rgba(255,255,255,0.04)] flex items-center justify-center">
                    <svg className="w-5 h-5 text-txt-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <p className="text-txt-tertiary text-sm">No posts yet.</p>
                  <p className="text-txt-tertiary/50 text-[13px] mt-1">Be the first to share an insight.</p>
                </div>
              )}
            </>
          }
        />
      </section>

      {/* Comments in a glass card */}
      <div className="glass-panel p-4 sm:p-5 mb-8">
        <SessionComments
          sessionId={session.id}
          initialComments={comments || []}
        />
      </div>
    </div>
  );
}
