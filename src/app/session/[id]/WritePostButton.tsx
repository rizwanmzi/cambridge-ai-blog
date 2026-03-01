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
      className="bg-navy-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-700 transition-colors"
    >
      Write a Post
    </Link>
  );
}
