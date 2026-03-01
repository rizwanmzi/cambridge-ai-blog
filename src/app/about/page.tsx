const categoryBadges = [
  { name: "Live Insight", color: "bg-green-500/20 text-green-400 border-green-500/40", desc: "Quick observations captured during or immediately after sessions" },
  { name: "Formal Notes", color: "bg-blue-500/20 text-blue-400 border-blue-500/40", desc: "Structured summaries of key concepts, frameworks, and readings" },
  { name: "Key Takeaway", color: "bg-amber-500/20 text-amber-400 border-amber-500/40", desc: "The ideas that stick" },
  { name: "Reflection", color: "bg-purple-500/20 text-purple-400 border-purple-500/40", desc: "How these ideas connect to real-world leadership challenges" },
];

export default function AboutPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-txt-primary mb-4">
          About the Programme
        </h1>
      </div>

      <div className="bg-dark-surface rounded-xl border border-dark-border p-6 sm:p-8 space-y-5">
        <p className="text-txt-secondary leading-relaxed">
          This is a shared space for the Cambridge AI Leadership Programme
          cohort to capture, discuss, and reflect on what we&apos;re learning
          &mdash; in real time.
        </p>
        <p className="text-txt-secondary leading-relaxed">
          The programme brings together senior leaders navigating the strategic
          implications of artificial intelligence. This blog exists so that the
          ideas, frameworks, and debates from each session don&apos;t disappear
          into notebooks. Instead, they live here &mdash; visible, searchable,
          and open for discussion.
        </p>
      </div>

      <div className="bg-dark-surface rounded-xl border border-dark-border p-6 sm:p-8">
        <h2 className="font-heading text-2xl font-semibold text-txt-primary mb-4">
          How it works
        </h2>
        <p className="text-txt-secondary leading-relaxed mb-6">
          Attendees on the programme post insights, notes, and reflections as
          they happen. Observers &mdash; whether colleagues, peers, or anyone
          curious about AI leadership &mdash; can follow along and join the
          conversation through comments.
        </p>

        <p className="text-txt-secondary leading-relaxed mb-4">
          You&apos;ll find four types of posts here:
        </p>
        <div className="space-y-3">
          {categoryBadges.map((cat) => (
            <div key={cat.name} className="flex items-start gap-3">
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mt-0.5 shrink-0 border ${cat.color}`}>
                {cat.name}
              </span>
              <span className="text-txt-secondary">{cat.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark-surface rounded-xl border border-dark-border p-6 sm:p-8">
        <h2 className="font-heading text-2xl font-semibold text-txt-primary mb-4">
          About Riz Iqbal
        </h2>
        <p className="text-txt-secondary leading-relaxed">
          Head of Deals AI &amp; Forward Deployed Engineering at PwC. 15 years
          in M&amp;A. Built this space to make sure the thinking from Cambridge
          doesn&apos;t stay in the room &mdash; the whole point is to
          forward-deploy these ideas into how we actually lead, build, and make
          decisions.
        </p>
      </div>
    </div>
  );
}
