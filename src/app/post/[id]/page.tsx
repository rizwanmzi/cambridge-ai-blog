import { createSupabaseServer } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";

export const revalidate = 0;

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServer();
  const { data: post } = await supabase
    .from("posts")
    .select("session_id")
    .eq("id", params.id)
    .single();

  if (!post) notFound();
  redirect(`/?session=${post.session_id}&post=${params.id}`);
}
