"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { canPost } from "@/lib/roles";

export default function NavBar() {
  const { profile, loading, signOut } = useAuth();

  return (
    <nav className="bg-navy-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="group">
          <span className="text-lg sm:text-xl font-semibold tracking-tight">
            Cambridge AI
          </span>
          <span className="text-navy-300 text-sm sm:text-base ml-2 font-light hidden sm:inline">
            Leadership Programme
          </span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
          <Link
            href="/"
            className="text-navy-200 hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-navy-200 hover:text-white transition-colors"
          >
            About
          </Link>
          {!loading && profile && canPost(profile.role) && (
            <Link
              href="/new-post"
              className="text-navy-200 hover:text-white transition-colors"
            >
              New Post
            </Link>
          )}
          {!loading && profile && (
            <button
              onClick={signOut}
              className="text-navy-400 hover:text-white transition-colors"
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
