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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  console.log("[NavBar] render:", { loading, user: !!user, profile: profile?.role ?? null });

  const linkClasses = "text-txt-secondary hover:text-txt-primary transition-colors";

  const navLinks = (
    <>
      <Link href="/" className={linkClasses} onClick={() => setMobileMenuOpen(false)}>
        Live Blog
      </Link>
      <Link href="/about" className={linkClasses} onClick={() => setMobileMenuOpen(false)}>
        About
      </Link>
      <Link href="/resources" className={linkClasses} onClick={() => setMobileMenuOpen(false)}>
        Resources
      </Link>
      <Link href="/digest" className={linkClasses} onClick={() => setMobileMenuOpen(false)}>
        Digest
      </Link>
      <Link href="/ask" className={linkClasses} onClick={() => setMobileMenuOpen(false)}>
        Ask
      </Link>
      {!loading && profile && canPost(profile.role) && (
        <Link href="/new-post" className={linkClasses} onClick={() => setMobileMenuOpen(false)}>
          New Post
        </Link>
      )}
      {!loading && user && (
        <button
          onClick={() => { setCatchMeUpOpen(true); setMobileMenuOpen(false); }}
          className="text-txt-secondary hover:text-accent transition-colors flex items-center gap-1"
        >
          <SparkleIcon className="w-3.5 h-3.5" />
          Catch Me Up
        </button>
      )}
      {!loading && user && (
        <button
          onClick={() => { signOut(); setMobileMenuOpen(false); }}
          className="text-txt-secondary/60 hover:text-txt-primary transition-colors"
        >
          Log out
        </button>
      )}
    </>
  );

  return (
    <>
      <nav className="bg-dark-bg/95 backdrop-blur border-b border-[rgba(255,255,255,0.06)] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="group">
            <span className="text-lg sm:text-xl font-heading font-semibold tracking-tight text-white">
              Cambridge AI
            </span>
            <span className="text-txt-secondary text-sm sm:text-base ml-2 font-light hidden sm:inline">
              Leadership Programme
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-txt-secondary hover:text-txt-primary p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile slide-out drawer */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-64 bg-dark-surface border-l border-[rgba(255,255,255,0.06)] z-50 md:hidden p-6 pt-20 flex flex-col gap-5 text-sm font-medium">
            {navLinks}
          </div>
        </>
      )}

      <CatchMeUpModal open={catchMeUpOpen} onClose={() => setCatchMeUpOpen(false)} />
    </>
  );
}
