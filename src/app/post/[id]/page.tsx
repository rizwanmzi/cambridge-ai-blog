import { createSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import PostContent from "./PostContent";
import CommentSection from "./CommentSection";
import RoleBadge from "@/components/RoleBadge";
import PostActions from "@/components/PostActions";
import TimeAgo from "@/components/TimeAgo";

const categoryColors: Record<string, string> = {
  "Live Insight": "border-green-500/30 text-green-400",
  "Formal Notes": "border-blue-500/30 text-blue-400",
  "Key Takeaway": "border-amber-500/30 text-amber-400",
  Reflection: "border-purple-500/30 text-purple-400",
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
        {post.sessions
          ? `Back to ${post.sessions.title}`
          : "Back to agenda"}
      </Link>

      <article className="max-w-3xl">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                categoryColors[post.category] || "bg-dark-hover text-txt-secondary border-[rgba(255,255,255,0.06)]"
              }`}
            >
              {post.category}
            </span>
            <TimeAgo date={post.created_at} />
            {post.profiles && (
              <span className="flex items-center gap-1.5 text-sm text-txt-secondary">
                <span>{post.profiles.username}</span>
                <RoleBadge role={post.profiles.role} />
              </span>
            )}
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white leading-tight">
            {post.title}
          </h1>
          {post.sessions && (
            <p className="text-sm text-txt-secondary mt-3">
              Session:{" "}
              <Link
                href={`/session/${post.sessions.id}`}
                className="text-accent hover:text-accent-hover hover:underline"
              >
                {post.sessions.title}
              </Link>
            </p>
          )}
        </header>

        <PostActions
          postId={post.id}
          authorId={post.author_id}
          initialTitle={post.title}
          initialBody={post.body}
        />

        <div className="prose max-w-none mb-12">
          <PostContent content={post.body} />
        </div>
      </article>

      <hr className="border-[rgba(255,255,255,0.06)] mb-8" />

      <CommentSection postId={post.id} initialComments={comments || []} />
    </div>
  );
}
