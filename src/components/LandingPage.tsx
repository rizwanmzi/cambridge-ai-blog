import Link from "next/link";

const categories = [
  { name: "Live Insight", cls: "cat-live-insight", desc: "quick observations captured during or immediately after sessions" },
  { name: "Formal Notes", cls: "cat-formal-notes", desc: "structured summaries of key concepts, frameworks, and readings" },
  { name: "Key Takeaway", cls: "cat-key-takeaway", desc: "the ideas that stick" },
  { name: "Reflection", cls: "cat-reflection", desc: "how these ideas connect to real-world leadership challenges" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
      <div className="text-center max-w-[520px]">
        <h1 className="text-[32px] font-bold leading-tight">
          <span className="text-white">Cambridge AI</span>{" "}
          <span className="text-[rgba(255,255,255,0.4)]">Leadership Programme</span>
        </h1>
        <p className="text-sm text-[rgba(255,255,255,0.4)] mt-4">
          Cohort 2 &mdash; Live Learning AI Blog
        </p>

        <div className="text-left mt-8 space-y-6">
          <p className="text-sm text-[rgba(255,255,255,0.5)] leading-[1.7]">
            A shared space for the Cambridge AI Leadership Programme cohort to
            capture, discuss, and reflect on what we&apos;re learning — in real
            time. The programme brings together senior leaders navigating the
            strategic implications of artificial intelligence.
          </p>

          <div>
            <h2 className="text-[13px] uppercase tracking-wider text-[rgba(255,255,255,0.6)] mb-3">How it works</h2>
            <p className="text-sm text-[rgba(255,255,255,0.5)] leading-[1.7] mb-4">
              Attendees post insights, notes, and reflections as they happen.
              Observers can follow along and join the conversation through comments.
            </p>
            <div className="space-y-2">
              {categories.map((cat) => (
                <p key={cat.name} className="text-sm text-[rgba(255,255,255,0.5)] leading-[1.7]">
                  <span className={`${cat.cls} font-medium`}>{cat.name}</span>
                  {" — "}{cat.desc}
                </p>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[13px] uppercase tracking-wider text-[rgba(255,255,255,0.6)] mb-3">About Riz Iqbal</h2>
            <p className="text-sm text-[rgba(255,255,255,0.5)] leading-[1.7]">
              Director, M&amp;A Operations — 15 years in deals. Built this space
              to make sure the thinking from Cambridge doesn&apos;t stay in the
              room — the whole point is to forward-deploy these ideas into how we
              actually lead, build, and make decisions.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/login" className="text-sm text-white hover:underline">
            Enter Programme &rarr;
          </Link>
        </div>

        <p className="text-[11px] text-[rgba(255,255,255,0.25)] mt-6 max-w-[480px] mx-auto leading-relaxed">
          Disclaimer: This blog is an independent initiative by a programme
          participant. It is not affiliated with, endorsed by, or officially
          associated with Cambridge Judge Business School or the University of
          Cambridge. All views and content are those of the individual contributors.
        </p>
      </div>
    </div>
  );
}
