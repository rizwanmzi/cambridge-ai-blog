import { createSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import PostContent from "./PostContent";
import CommentSection from "./CommentSection";
import RoleBadge from "@/components/RoleBadge";
import PostActions from "@/components/PostActions";
import TimeAgo from "@/components/TimeAgo";

const categoryPillClass: Record<string, string> = {
  "Live Insight": "cat-pill-live-insight",
  "Formal Notes": "cat-pill-formal-notes",
  "Key Takeaway": "cat-pill-key-takeaway",
  Reflection: "cat-pill-reflection",
};

const categoryBorderColor: Record<string, string> = {
  "Live Insight": "rgba(74,222,128,0.5)",
  "Formal Notes": "rgba(96,165,250,0.5)",
  "Key Takeaway": "rgba(251,191,36,0.5)",
  Reflection: "rgba(192,132,252,0.5)",
};

const categoryGlowColor: Record<string, string> = {
  "Live Insight": "rgba(74,222,128,0.06)",
  "Formal Notes": "rgba(96,165,250,0.06)",
  "Key Takeaway": "rgba(251,191,36,0.06)",
  Reflection: "rgba(192,132,252,0.06)",
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

  const borderColor = categoryBorderColor[post.category] || "transparent";
  const glowColor = categoryGlowColor[post.category] || "transparent";

  return (
    <div className="max-w-[720px] mx-auto">
      {/* Sticky back nav */}
      <div className="sticky top-0 z-30 -mx-4 px-4 pt-3 pb-3 bg-dark-bg/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-3">
          <Link
            href={post.sessions ? `/session/${post.sessions.id}` : "/"}
            className="group flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-all duration-200 shrink-0"
          >
            <svg className="w-4 h-4 text-txt-tertiary group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-[13px] text-txt-tertiary truncate">
            {post.sessions ? post.sessions.title : "Programme Agenda"}
          </span>
        </div>
      </div>

      {/* Post article in glass panel */}
      <article
        className="glass-panel mt-6 mb-8 overflow-hidden border-l-[3px]"
        style={{
          borderLeftColor: borderColor,
          boxShadow: `inset 4px 0 16px ${glowColor}`,
        }}
      >
        <div className="p-5 sm:p-6">
          <header className="mb-5">
            <div className="flex items-center gap-2.5 text-[13px] text-txt-tertiary mb-3 flex-wrap">
              <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${categoryPillClass[post.category] || "text-txt-tertiary bg-[rgba(255,255,255,0.05)]"}`}>
                {post.category}
              </span>
              <span className="text-[rgba(255,255,255,0.15)]">&middot;</span>
              <TimeAgo date={post.created_at} />
              {post.profiles && (
                <>
                  <span className="text-[rgba(255,255,255,0.15)]">&middot;</span>
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

          <div className="prose max-w-none">
            <PostContent content={post.body} />
          </div>
        </div>
      </article>

      {/* Comments section in glass panel */}
      <div className="glass-panel p-4 sm:p-5 mb-8">
        <CommentSection postId={post.id} initialComments={comments || []} />
      </div>
    </div>
  );
}
