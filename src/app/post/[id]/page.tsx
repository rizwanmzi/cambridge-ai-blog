import { createSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import PostContent from "./PostContent";
import CommentSection from "./CommentSection";
import RoleBadge from "@/components/RoleBadge";
import PostActions from "@/components/PostActions";

const categoryColors: Record<string, string> = {
  "Live Insight": "bg-green-500/20 text-green-400 border-green-500/40",
  "Formal Notes": "bg-blue-500/20 text-blue-400 border-blue-500/40",
  "Key Takeaway": "bg-amber-500/20 text-amber-400 border-amber-500/40",
  Reflection: "bg-purple-500/20 text-purple-400 border-purple-500/40",
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
                categoryColors[post.category] || "bg-dark-hover text-txt-secondary border-dark-border"
              }`}
            >
              {post.category}
            </span>
            <time className="text-sm text-txt-secondary">
              {new Date(post.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
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
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-txt-primary leading-tight">
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

      <hr className="border-dark-border mb-8" />

      <CommentSection postId={post.id} initialComments={comments || []} />
    </div>
  );
}
