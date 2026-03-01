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

  const { data: comments } = await supabase
    .from("comments")
    .select("*, profiles(username, role)")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  const dayLabels: Record<number, string> = {
    0: "Sunday 1 March", 1: "Monday 2 March", 2: "Tuesday 3 March",
    3: "Wednesday 4 March", 4: "Thursday 5 March", 5: "Friday 6 March",
  };

  return (
    <div className="max-w-[720px] mx-auto">
      <Link
        href="/"
        className="inline-flex items-center text-[13px] text-txt-tertiary hover:text-txt-secondary transition-colors mb-6"
      >
        &larr; <span className="hidden sm:inline ml-1">Programme Agenda</span>
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl sm:text-2xl font-semibold text-white leading-tight">
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

      <QuickPostBar sessionId={session.id} />

      <section className="mb-10">
        <SessionTabs
          sessionId={session.id}
          postsContent={
            <>
              {posts && posts.length > 0 ? (
                <div>
                  {(posts as PostWithProfile[]).map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="block py-3 border-b border-dark-border hover:bg-dark-hover transition-colors -mx-2 px-2 rounded-sm group"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm text-[rgba(255,255,255,0.85)] group-hover:text-white truncate">
                          {post.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[13px] text-txt-tertiary">
                        <span className={`${categoryClass[post.category] || "text-txt-tertiary"}`}>
                          ✦ {post.category}
                        </span>
                        <span>&middot;</span>
                        {post.profiles && (
                          <>
                            <span className="text-txt-tertiary">{post.profiles.username}</span>
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
                <p className="text-center py-10 text-txt-tertiary text-sm">
                  No posts yet. Be the first to share an insight.
                </p>
              )}
            </>
          }
        />
      </section>

      <div className="border-t border-dark-border pt-6">
        <SessionComments
          sessionId={session.id}
          initialComments={comments || []}
        />
      </div>
    </div>
  );
}
