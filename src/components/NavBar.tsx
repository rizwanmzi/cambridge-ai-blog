"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { canPost } from "@/lib/roles";
import CatchMeUpModal from "./CatchMeUpModal";
import KeyboardShortcuts from "./KeyboardShortcuts";

export default function NavBar() {
  const { user, profile, loading, signOut } = useAuth();
  const [catchMeUpOpen, setCatchMeUpOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;
  const linkClass = (href: string) =>
    `text-[13px] ${isActive(href) ? "text-[rgba(255,255,255,0.9)]" : "text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.9)]"} transition-colors`;

  return (
    <>
      <nav className="h-12 bg-dark-bg border-b border-dark-border sticky top-0 z-40">
        <div className="max-w-[720px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-white">
            Cambridge AI
          </Link>

          {/* Desktop nav */}
          {!loading && user && (
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className={linkClass("/")}>Blog</Link>
              <Link href="/resources" className={linkClass("/resources")}>Resources</Link>
              <Link href="/digest" className={linkClass("/digest")}>Digest</Link>
              <Link href="/ask" className={linkClass("/ask")}>Ask</Link>
              {profile && canPost(profile.role) && (
                <Link href="/new-post" className={linkClass("/new-post")}>New Post</Link>
              )}
              <button
                onClick={() => setCatchMeUpOpen(true)}
                className="text-[13px] text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.9)] transition-colors"
              >
                Catch Me Up
              </button>
              <Link href="/about" className={linkClass("/about")}>About</Link>
              <button
                onClick={() => signOut()}
                className="text-[13px] text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.9)] transition-colors"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </nav>

      <CatchMeUpModal open={catchMeUpOpen} onClose={() => setCatchMeUpOpen(false)} />
      <KeyboardShortcuts onOpenCatchMeUp={() => setCatchMeUpOpen(true)} />
    </>
  );
}
