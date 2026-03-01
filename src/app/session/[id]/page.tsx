import { createSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import RoleBadge from "@/components/RoleBadge";
import SessionComments from "./SessionComments";
import SessionTabs from "./SessionTabs";

interface PostWithProfile {
  id: number;
  title: string;
  body: string;
  category: string;
  created_at: string;
  profiles: { username: string; role: string } | null;
}

const categoryColors: Record<string, string> = {
  "Live Insight": "bg-green-500/20 text-green-400 border-green-500/40",
  "Formal Notes": "bg-blue-500/20 text-blue-400 border-blue-500/40",
  "Key Takeaway": "bg-amber-500/20 text-amber-400 border-amber-500/40",
  Reflection: "bg-purple-500/20 text-purple-400 border-purple-500/40",
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

  if (error || !session) {
    notFound();
  }

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
    0: "Sunday 1 March",
    1: "Monday 2 March",
    2: "Tuesday 3 March",
    3: "Wednesday 4 March",
    4: "Thursday 5 March",
    5: "Friday 6 March",
  };

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center text-sm text-txt-secondary hover:text-accent transition-colors mb-8"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to agenda
      </Link>

      {/* Session header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3 text-sm text-txt-secondary">
          <span>Day {session.day_number}</span>
          <span>&middot;</span>
          <span>{dayLabels[session.day_number]}</span>
          <span>&middot;</span>
          <span className="font-mono">
            {formatTime(session.start_time)}–{formatTime(session.end_time)}
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-txt-primary leading-tight mb-2">
          {session.title}
        </h1>
        {session.faculty && (
          <p className="text-txt-secondary text-lg">{session.faculty}</p>
        )}
        {session.location && (
          <p className="text-txt-secondary/60 text-sm mt-1">{session.location}</p>
        )}
        {session.description && (
          <p className="text-txt-secondary mt-4">{session.description}</p>
        )}
      </header>

      {/* Posts + AI Summary tabs */}
      <section className="mb-12">
        <SessionTabs
          sessionId={session.id}
          postsContent={
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-txt-primary">
                  Posts{" "}
                  {posts && posts.length > 0 && (
                    <span className="text-txt-secondary font-normal">
                      ({posts.length})
                    </span>
                  )}
                </h2>
                <WritePostButton sessionId={session.id} />
              </div>

              {posts && posts.length > 0 ? (
                <div className="space-y-4">
                  {(posts as PostWithProfile[]).map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="block group"
                    >
                      <article className="bg-dark-surface border border-dark-border rounded-xl p-5 hover:border-accent/30 hover:bg-dark-hover hover:-translate-y-0.5 transition-all">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                              categoryColors[post.category] ||
                              "bg-dark-hover text-txt-secondary border-dark-border"
                            }`}
                          >
                            {post.category}
                          </span>
                          <time className="text-sm text-txt-secondary">
                            {new Date(post.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </time>
                          {post.profiles && (
                            <span className="flex items-center gap-1.5 text-sm text-txt-secondary">
                              <span>{post.profiles.username}</span>
                              <RoleBadge role={post.profiles.role} />
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-txt-primary group-hover:text-accent transition-colors mb-1">
                          {post.title}
                        </h3>
                        <p className="text-txt-secondary text-sm leading-relaxed">
                          {post.body.replace(/[#*_`>\-\[\]()]/g, "").slice(0, 150)}
                          {post.body.length > 150 ? "..." : ""}
                        </p>
                      </article>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-dark-border rounded-xl">
                  <p className="text-txt-secondary">No posts yet for this session.</p>
                </div>
              )}
            </>
          }
        />
      </section>

      {/* Session comments */}
      <hr className="border-dark-border mb-8" />
      <SessionComments
        sessionId={session.id}
        initialComments={comments || []}
      />
    </div>
  );
}

// Client component for the write post button
import { WritePostButton } from "./WritePostButton";
