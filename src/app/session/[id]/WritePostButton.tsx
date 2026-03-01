"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { canPost } from "@/lib/roles";

export function WritePostButton({ sessionId }: { sessionId: number }) {
  const { profile, loading } = useAuth();

  if (loading || !profile || !canPost(profile.role)) {
    return null;
  }

  return (
    <Link
      href={`/new-post?session=${sessionId}`}
      className="text-[13px] text-txt-tertiary hover:text-txt-secondary transition-colors"
    >
      Write a Post
    </Link>
  );
}
