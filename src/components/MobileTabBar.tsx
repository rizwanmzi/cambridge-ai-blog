"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import CatchMeUpModal from "./CatchMeUpModal";
import GuideModal from "./GuideModal";

export default function MobileTabBar() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [catchMeUpOpen, setCatchMeUpOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  // Don't show on login/signup/landing
  if (!user || loading) return null;

  const isActive = (href: string) => pathname === href;
  const tabClass = (href: string) =>
    `flex flex-col items-center gap-0.5 min-w-0 ${isActive(href) ? "text-white" : "text-[rgba(255,255,255,0.35)]"}`;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-dark-bg border-t border-dark-border pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-14 px-2">
          <Link href="/" className={tabClass("/")}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span className="text-[10px]">Blog</span>
          </Link>
          <Link href="/digest" className={tabClass("/digest")}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <span className="text-[10px]">Digest</span>
          </Link>
          <Link href="/ask" className={tabClass("/ask")}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <span className="text-[10px]">Ask</span>
          </Link>
          <button onClick={() => setMoreOpen(true)} className={`flex flex-col items-center gap-0.5 ${moreOpen ? "text-white" : "text-[rgba(255,255,255,0.35)]"}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </div>

      {/* More sheet */}
      {moreOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 md:hidden" onClick={() => setMoreOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-dark-surface border-t border-dark-border rounded-t-xl modal-enter pb-[env(safe-area-inset-bottom)]">
            <div className="w-10 h-1 bg-[rgba(255,255,255,0.15)] rounded-full mx-auto mt-3 mb-4" />
            <div className="px-6 pb-6 space-y-1">
              <Link
                href="/resources"
                onClick={() => setMoreOpen(false)}
                className="block py-3 text-sm text-[rgba(255,255,255,0.7)] hover:text-white transition-colors"
              >
                Resources
              </Link>
              <button
                onClick={() => { setMoreOpen(false); setCatchMeUpOpen(true); }}
                className="block w-full text-left py-3 text-sm text-[rgba(255,255,255,0.7)] hover:text-white transition-colors"
              >
                Catch Me Up
              </button>
              <button
                onClick={() => { setMoreOpen(false); setGuideOpen(true); }}
                className="block w-full text-left py-3 text-sm text-[rgba(255,255,255,0.7)] hover:text-white transition-colors"
              >
                Guide
              </button>
              <Link
                href="/about"
                onClick={() => setMoreOpen(false)}
                className="block py-3 text-sm text-[rgba(255,255,255,0.7)] hover:text-white transition-colors"
              >
                About
              </Link>
              <div className="border-t border-dark-border my-2" />
              <button
                onClick={() => { signOut(); setMoreOpen(false); }}
                className="block w-full text-left py-3 text-sm text-[rgba(255,255,255,0.4)] hover:text-white transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Catch me up modal */}
      {catchMeUpOpen && (
        <CatchMeUpModal open={catchMeUpOpen} onClose={() => setCatchMeUpOpen(false)} />
      )}
      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
}
