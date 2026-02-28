import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const postId = request.nextUrl.searchParams.get("post_id");

  if (!postId) {
    return NextResponse.json(
      { error: "post_id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { post_id, author_name, body: commentBody } = body;

  if (!post_id || !author_name || !commentBody) {
    return NextResponse.json(
      { error: "post_id, author_name, and body are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id, author_name, body: commentBody })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
