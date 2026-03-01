const categoryBadges = [
  { name: "Live Insight", color: "border-green-500/30 text-green-400" },
  { name: "Formal Notes", color: "border-blue-500/30 text-blue-400" },
  { name: "Key Takeaway", color: "border-amber-500/30 text-amber-400" },
  { name: "Reflection", color: "border-purple-500/30 text-purple-400" },
];

export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-8">
        About the Programme
      </h1>

      <div className="bg-[#0f1520] rounded-xl border border-[rgba(255,255,255,0.06)] p-6 sm:p-8">
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
          {categoryBadges.map((cat) => (
            <div key={cat.name} className="flex items-start gap-3">
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mt-0.5 shrink-0 border ${cat.color}`}>
                {cat.name}
              </span>
              <span className="text-txt-secondary">
                {cat.name === "Live Insight" && "Quick observations captured during or immediately after sessions"}
                {cat.name === "Formal Notes" && "Structured summaries of key concepts, frameworks, and readings"}
                {cat.name === "Key Takeaway" && "The ideas that stick"}
                {cat.name === "Reflection" && "How these ideas connect to real-world leadership challenges"}
              </span>
            </div>
          ))}
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
    </div>
  );
}
