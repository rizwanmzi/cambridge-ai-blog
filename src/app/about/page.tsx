const categories = [
  { name: "Live Insight", className: "cat-live-insight" },
  { name: "Formal Notes", className: "cat-formal-notes" },
  { name: "Key Takeaway", className: "cat-key-takeaway" },
  { name: "Reflection", className: "cat-reflection" },
];

const categoryDescriptions: Record<string, string> = {
  "Live Insight": "Quick observations captured during or immediately after sessions",
  "Formal Notes": "Structured summaries of key concepts, frameworks, and readings",
  "Key Takeaway": "The ideas that stick",
  Reflection: "How these ideas connect to real-world leadership challenges",
};

export default function AboutPage() {
  return (
    <div className="max-w-[720px] mx-auto">
      <h1 className="text-lg font-semibold text-white mb-6">About the Programme</h1>

      <div className="space-y-4 text-sm text-[rgba(255,255,255,0.7)] leading-relaxed">
        <p>
          This is a shared space for the Cambridge AI Leadership Programme
          cohort to capture, discuss, and reflect on what we&apos;re learning
          &mdash; in real time.
        </p>
        <p>
          The programme brings together senior leaders navigating the strategic
          implications of artificial intelligence. This blog exists so that the
          ideas, frameworks, and debates from each session don&apos;t disappear
          into notebooks. Instead, they live here &mdash; visible, searchable,
          and open for discussion.
        </p>
      </div>

      <h2 className="text-[13px] font-medium text-txt-secondary mt-8 mb-3">How it works</h2>
      <div className="space-y-3 text-sm text-[rgba(255,255,255,0.7)] leading-relaxed">
        <p>
          Attendees on the programme post insights, notes, and reflections as
          they happen. Observers &mdash; whether colleagues, peers, or anyone
          curious about AI leadership &mdash; can follow along and join the
          conversation through comments.
        </p>
        <p>You&apos;ll find four types of posts:</p>
      </div>

      <div className="space-y-2 mt-3 mb-8">
        {categories.map((cat) => (
          <div key={cat.name} className="flex items-start gap-3">
            <span className={`text-[13px] shrink-0 ${cat.className}`}>
              ✦ {cat.name}
            </span>
            <span className="text-sm text-txt-tertiary">
              {categoryDescriptions[cat.name]}
            </span>
          </div>
        ))}
      </div>

      <h2 className="text-[13px] font-medium text-txt-secondary mb-3">About Riz Iqbal</h2>
      <p className="text-sm text-[rgba(255,255,255,0.7)] leading-relaxed">
        Director, M&amp;A Operations &mdash; 15 years in deals. Built this
        space to make sure the thinking from Cambridge doesn&apos;t stay in
        the room &mdash; the whole point is to forward-deploy these ideas
        into how we actually lead, build, and make decisions.
      </p>

      <div className="mt-10 pt-6 border-t border-[rgba(255,255,255,0.06)]">
        <p className="text-[11px] text-txt-tertiary leading-relaxed">
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
