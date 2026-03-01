"use client";

import ParticleBackground from "./ParticleBackground";
import Link from "next/link";

const categoryBadges = [
  { name: "Live Insight", color: "border-green-500/30 text-green-400" },
  { name: "Formal Notes", color: "border-blue-500/30 text-blue-400" },
  { name: "Key Takeaway", color: "border-amber-500/30 text-amber-400" },
  { name: "Reflection", color: "border-purple-500/30 text-purple-400" },
];

export default function LandingPage() {
  return (
    <div className="fixed inset-0 z-50 bg-dark-bg overflow-y-auto">
      <ParticleBackground />

      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center pt-20 sm:pt-32 pb-10">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-3">
            Cambridge AI Leadership Programme
          </h1>
          <p className="text-[#e2e8f0] text-lg sm:text-xl">
            Cohort 2 &mdash; Live Learning AI Blog
          </p>
        </div>

        {/* Single content card */}
        <div className="w-full max-w-2xl bg-[#0f1520] rounded-xl border border-[rgba(255,255,255,0.06)] p-6 sm:p-8">
          <p className="text-txt-secondary leading-relaxed mb-5">
            This is a shared space for the Cambridge AI Leadership Programme
            cohort to capture, discuss, and reflect on what we&apos;re learning
            &mdash; in real time.
          </p>
          <p className="text-txt-secondary leading-relaxed mb-8">
            The programme brings together senior leaders navigating the strategic
            implications of artificial intelligence. This blog exists so that the
            ideas, frameworks, and debates from each session don&apos;t disappear
            into notebooks. Instead, they live here &mdash; visible, searchable,
            and open for discussion.
          </p>

          <h2 className="font-heading text-xl font-semibold text-[#e2e8f0] mb-4">
            How it works
          </h2>
          <p className="text-txt-secondary leading-relaxed mb-5">
            Attendees on the programme post insights, notes, and reflections as
            they happen. Observers &mdash; whether colleagues, peers, or anyone
            curious about AI leadership &mdash; can follow along and join the
            conversation through comments.
          </p>
          <p className="text-txt-secondary leading-relaxed mb-4">
            You&apos;ll find four types of posts here:
          </p>
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mt-0.5 shrink-0 border ${categoryBadges[0].color}`}>
                Live Insight
              </span>
              <span className="text-txt-secondary">Quick observations captured during or immediately after sessions</span>
            </div>
            <div className="flex items-start gap-3">
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mt-0.5 shrink-0 border ${categoryBadges[1].color}`}>
                Formal Notes
              </span>
              <span className="text-txt-secondary">Structured summaries of key concepts, frameworks, and readings</span>
            </div>
            <div className="flex items-start gap-3">
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mt-0.5 shrink-0 border ${categoryBadges[2].color}`}>
                Key Takeaway
              </span>
              <span className="text-txt-secondary">The ideas that stick</span>
            </div>
            <div className="flex items-start gap-3">
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mt-0.5 shrink-0 border ${categoryBadges[3].color}`}>
                Reflection
              </span>
              <span className="text-txt-secondary">How these ideas connect to real-world leadership challenges</span>
            </div>
          </div>

          <h2 className="font-heading text-xl font-semibold text-[#e2e8f0] mb-4">
            About Riz Iqbal
          </h2>
          <p className="text-txt-secondary leading-relaxed">
            Director, M&amp;A Operations &mdash; 15 years in deals. Built this
            space to make sure the thinking from Cambridge doesn&apos;t stay in
            the room &mdash; the whole point is to forward-deploy these ideas
            into how we actually lead, build, and make decisions.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="max-w-lg mx-auto text-center mt-8 pt-6 border-t border-[rgba(255,255,255,0.06)]">
          <p className="text-xs text-txt-secondary">
            Disclaimer: This blog is an independent initiative by a programme
            participant. It is not affiliated with, endorsed by, or officially
            associated with Cambridge Judge Business School or the University of
            Cambridge. All views and content are those of the individual
            contributors.
          </p>
        </div>

        {/* Enter button */}
        <div className="text-center py-10">
          <Link
            href="/login"
            className="inline-block px-8 py-3.5 text-lg font-medium text-white rounded-xl border border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.5)] transition-all"
          >
            Enter Programme &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
