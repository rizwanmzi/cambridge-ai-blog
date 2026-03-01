import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import RoleBadge from "@/components/RoleBadge";
import SessionComments from "./SessionComments";

interface PostWithProfile {
  id: number;
  title: string;
  body: string;
  category: string;
  created_at: string;
  profiles: { username: string; role: string } | null;
}

const categoryColors: Record<string, string> = {
  "Live Insight": "bg-blue-100 text-blue-800",
  "Formal Notes": "bg-navy-100 text-navy-700",
  "Key Takeaway": "bg-amber-100 text-amber-800",
  Reflection: "bg-emerald-100 text-emerald-800",
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
        className="inline-flex items-center text-sm text-navy-400 hover:text-navy-600 transition-colors mb-8"
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
        <div className="flex items-center gap-3 mb-3 text-sm text-navy-400">
          <span>Day {session.day_number}</span>
          <span>&middot;</span>
          <span>{dayLabels[session.day_number]}</span>
          <span>&middot;</span>
          <span className="font-mono">
            {formatTime(session.start_time)}–{formatTime(session.end_time)}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 leading-tight mb-2">
          {session.title}
        </h1>
        {session.faculty && (
          <p className="text-navy-500 text-lg">{session.faculty}</p>
        )}
        {session.location && (
          <p className="text-navy-400 text-sm mt-1">{session.location}</p>
        )}
        {session.description && (
          <p className="text-navy-600 mt-4">{session.description}</p>
        )}
      </header>

      {/* Posts section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-navy-900">
            Posts{" "}
            {posts && posts.length > 0 && (
              <span className="text-navy-400 font-normal">
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
                <article className="border border-navy-100 rounded-lg p-5 hover:border-navy-300 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        categoryColors[post.category] ||
                        "bg-navy-100 text-navy-700"
                      }`}
                    >
                      {post.category}
                    </span>
                    <time className="text-sm text-navy-400">
                      {new Date(post.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                    {post.profiles && (
                      <span className="flex items-center gap-1.5 text-sm text-navy-500">
                        <span>{post.profiles.username}</span>
                        <RoleBadge role={post.profiles.role} />
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-navy-900 group-hover:text-navy-600 transition-colors mb-1">
                    {post.title}
                  </h3>
                  <p className="text-navy-500 text-sm leading-relaxed">
                    {post.body.replace(/[#*_`>\-\[\]()]/g, "").slice(0, 150)}
                    {post.body.length > 150 ? "..." : ""}
                  </p>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-navy-200 rounded-lg">
            <p className="text-navy-400">No posts yet for this session.</p>
          </div>
        )}
      </section>

      {/* Session comments */}
      <hr className="border-navy-100 mb-8" />
      <SessionComments
        sessionId={session.id}
        initialComments={comments || []}
      />
    </div>
  );
}

// Client component for the write post button
import { WritePostButton } from "./WritePostButton";
