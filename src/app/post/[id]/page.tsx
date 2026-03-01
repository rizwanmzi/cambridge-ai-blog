import { createSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import PostContent from "./PostContent";
import CommentSection from "./CommentSection";
import RoleBadge from "@/components/RoleBadge";
import PostActions from "@/components/PostActions";
import TimeAgo from "@/components/TimeAgo";

const categoryClass: Record<string, string> = {
  "Live Insight": "cat-live-insight",
  "Formal Notes": "cat-formal-notes",
  "Key Takeaway": "cat-key-takeaway",
  Reflection: "cat-reflection",
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

  if (error || !post) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: rawComments } = await supabase
    .from("comments")
    .select("*, profiles(username, role)")
    .eq("post_id", post.id)
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

  return (
    <div className="max-w-[720px] mx-auto">
      <Link
        href={post.sessions ? `/session/${post.sessions.id}` : "/"}
        className="inline-flex items-center text-[13px] text-txt-tertiary hover:text-txt-secondary transition-colors mb-6"
      >
        &larr; <span className="ml-1">{post.sessions ? post.sessions.title : "Programme Agenda"}</span>
      </Link>

      <article>
        <header className="mb-6">
          <div className="flex items-center gap-2 text-[13px] text-txt-tertiary mb-3 flex-wrap">
            <span className={categoryClass[post.category] || "text-txt-tertiary"}>
              ✦ {post.category}
            </span>
            <span>&middot;</span>
            <TimeAgo date={post.created_at} />
            {post.profiles && (
              <>
                <span>&middot;</span>
                <span>{post.profiles.username}</span>
                <RoleBadge role={post.profiles.role} />
              </>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-white leading-tight">
            {post.title}
          </h1>
        </header>

        <PostActions
          postId={post.id}
          authorId={post.author_id}
          initialTitle={post.title}
          initialBody={post.body}
        />

        <div className="prose max-w-none mb-10">
          <PostContent content={post.body} />
        </div>
      </article>

      <div className="border-t border-dark-border pt-6">
        <CommentSection postId={post.id} initialComments={comments || []} />
      </div>
    </div>
  );
}
