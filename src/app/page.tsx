import Link from "next/link";
import { supabase } from "@/lib/supabase";

const categoryColors: Record<string, string> = {
  "Live Insight": "bg-blue-100 text-blue-800",
  "Formal Notes": "bg-navy-100 text-navy-700",
  "Key Takeaway": "bg-amber-100 text-amber-800",
  Reflection: "bg-emerald-100 text-emerald-800",
};

interface Post {
  id: number;
  title: string;
  body: string;
  category: string;
  created_at: string;
}

export const revalidate = 0;

export default async function Home() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-navy-900 mb-4">
          Cambridge AI Leadership Programme
        </h1>
        <p className="text-navy-500">
          Unable to load posts. Please check your Supabase configuration.
        </p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div>
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-3">
            Live Learning Blog
          </h1>
          <p className="text-navy-500 text-lg">
            Insights and reflections from the Cambridge AI Leadership Programme.
          </p>
        </div>
        <div className="text-center py-16 border-2 border-dashed border-navy-200 rounded-lg">
          <p className="text-navy-400 text-lg">No posts yet.</p>
          <p className="text-navy-300 text-sm mt-2">
            Posts will appear here once published.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-3">
          Live Learning Blog
        </h1>
        <p className="text-navy-500 text-lg">
          Insights and reflections from the Cambridge AI Leadership Programme.
        </p>
      </div>

      <div className="space-y-6">
        {(posts as Post[]).map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="block group"
          >
            <article className="border border-navy-100 rounded-lg p-6 hover:border-navy-300 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-3">
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
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </div>
              <h2 className="text-xl font-semibold text-navy-900 group-hover:text-navy-600 transition-colors mb-2">
                {post.title}
              </h2>
              <p className="text-navy-500 leading-relaxed">
                {post.body.replace(/[#*_`>\-\[\]()]/g, "").slice(0, 150)}
                {post.body.length > 150 ? "..." : ""}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
