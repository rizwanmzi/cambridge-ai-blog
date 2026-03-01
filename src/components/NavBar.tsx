"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { canPost } from "@/lib/roles";
import SparkleIcon from "./SparkleIcon";
import CatchMeUpModal from "./CatchMeUpModal";

export default function NavBar() {
  const { user, profile, loading, signOut } = useAuth();
  const [catchMeUpOpen, setCatchMeUpOpen] = useState(false);

  console.log("[NavBar] render:", { loading, user: !!user, profile: profile?.role ?? null });

  return (
    <>
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
            <Link
              href="/digest"
              className="text-navy-200 hover:text-white transition-colors"
            >
              Digest
            </Link>
            <Link
              href="/ask"
              className="text-navy-200 hover:text-white transition-colors"
            >
              Ask
            </Link>
            {!loading && profile && canPost(profile.role) && (
              <Link
                href="/new-post"
                className="text-navy-200 hover:text-white transition-colors"
              >
                New Post
              </Link>
            )}
            {!loading && user && (
              <button
                onClick={() => setCatchMeUpOpen(true)}
                className="text-navy-200 hover:text-white transition-colors flex items-center gap-1"
              >
                <SparkleIcon className="w-3.5 h-3.5" />
                Catch Me Up
              </button>
            )}
            {!loading && user && (
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
      <CatchMeUpModal open={catchMeUpOpen} onClose={() => setCatchMeUpOpen(false)} />
    </>
  );
}
