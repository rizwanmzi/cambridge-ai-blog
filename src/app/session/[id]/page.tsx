import { createSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import RoleBadge from "@/components/RoleBadge";
import SessionComments from "./SessionComments";
import SessionTabs from "./SessionTabs";
import QuickPostBar from "@/components/QuickPostBar";
import TimeAgo from "@/components/TimeAgo";

interface PostWithProfile {
  id: number;
  title: string;
  body: string;
  category: string;
  created_at: string;
  profiles: { username: string; role: string } | null;
}

const categoryClass: Record<string, string> = {
  "Live Insight": "cat-live-insight",
  "Formal Notes": "cat-formal-notes",
  "Key Takeaway": "cat-key-takeaway",
  Reflection: "cat-reflection",
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
    <div className="max-w-[720px] mx-auto">
      {/* Back link with hover arrow animation */}
      <Link
        href="/"
        className="group inline-flex items-center text-[13px] text-txt-tertiary hover:text-txt-secondary transition-all duration-200 mb-6"
      >
        <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">&larr;</span>
        <span className="hidden sm:inline ml-1.5">Programme Agenda</span>
      </Link>

      {/* Session header */}
      <header className="mb-6 pb-6 border-b border-[rgba(255,255,255,0.06)]">
        <h1 className="text-2xl font-semibold text-white leading-tight">
          {session.title}
        </h1>
        <p className="text-[13px] text-txt-tertiary mt-2">
          Day {session.day_number} &middot; {dayLabels[session.day_number]}
          {" "}&middot; {formatTime(session.start_time)}–{formatTime(session.end_time)}
          {session.faculty && <> &middot; {session.faculty}</>}
        </p>
        {session.description && (
          <p className="text-sm text-txt-secondary mt-3">{session.description}</p>
        )}
      </header>

      {/* Post composer */}
      <QuickPostBar sessionId={session.id} />

      {/* Posts + AI tabs in a card */}
      <section className="mb-8 bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
        <SessionTabs
          sessionId={session.id}
          postsContent={
            <>
              {posts && posts.length > 0 ? (
                <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                  {(posts as PostWithProfile[]).map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className={`block px-4 py-3.5 hover:bg-[rgba(255,255,255,0.03)] transition-all duration-200 group border-l-2 ${
                        categoryClass[post.category]
                          ? `border-l-current`
                          : "border-l-transparent"
                      }`}
                      style={{
                        borderLeftColor:
                          post.category === "Live Insight" ? "rgba(74,222,128,0.4)" :
                          post.category === "Formal Notes" ? "rgba(96,165,250,0.4)" :
                          post.category === "Key Takeaway" ? "rgba(251,191,36,0.4)" :
                          post.category === "Reflection" ? "rgba(192,132,252,0.4)" :
                          "transparent"
                      }}
                    >
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="text-sm text-[rgba(255,255,255,0.85)] group-hover:text-white transition-colors duration-200 truncate flex-1">
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
                            <span>&middot;</span>
                          </>
                        )}
                        <TimeAgo date={post.created_at} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-txt-tertiary text-sm">No posts yet.</p>
                  <p className="text-txt-tertiary/60 text-[13px] mt-1">Be the first to share an insight.</p>
                </div>
              )}
            </>
          }
        />
      </section>

      {/* Comments in a card */}
      <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 sm:p-5">
        <SessionComments
          sessionId={session.id}
          initialComments={comments || []}
        />
      </div>
    </div>
  );
}
