import { createSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import PostContent from "./PostContent";
import CommentSection from "./CommentSection";
import RoleBadge from "@/components/RoleBadge";

const categoryColors: Record<string, string> = {
  "Live Insight": "bg-blue-100 text-blue-800",
  "Formal Notes": "bg-navy-100 text-navy-700",
  "Key Takeaway": "bg-amber-100 text-amber-800",
  Reflection: "bg-emerald-100 text-emerald-800",
};

export const revalidate = 0;

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServer();

  const { data: post, error } = await supabase
    .from("posts")
    .select("*, profiles(username, role), sessions(id, title, day_number)")
    .eq("id", params.id)
    .single();

  if (error || !post) {
    notFound();
  }

  const { data: comments } = await supabase
    .from("comments")
    .select("*, profiles(username, role)")
    .eq("post_id", post.id)
    .order("created_at", { ascending: true });

  return (
    <div>
      <Link
        href={post.sessions ? `/session/${post.sessions.id}` : "/"}
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
        {post.sessions
          ? `Back to ${post.sessions.title}`
          : "Back to agenda"}
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                categoryColors[post.category] || "bg-navy-100 text-navy-700"
              }`}
            >
              {post.category}
            </span>
            <time className="text-sm text-navy-400">
              {new Date(post.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
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
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 leading-tight">
            {post.title}
          </h1>
          {post.sessions && (
            <p className="text-sm text-navy-400 mt-3">
              Session:{" "}
              <Link
                href={`/session/${post.sessions.id}`}
                className="text-navy-500 hover:underline"
              >
                {post.sessions.title}
              </Link>
            </p>
          )}
        </header>

        <div className="prose max-w-none mb-12">
          <PostContent content={post.body} />
        </div>
      </article>

      <hr className="border-navy-100 mb-8" />

      <CommentSection postId={post.id} initialComments={comments || []} />
    </div>
  );
}
