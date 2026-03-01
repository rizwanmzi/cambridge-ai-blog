export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
        Cambridge AI Leadership Programme — Live Learning AI Blog
      </h1>

      <div className="space-y-5 text-navy-700 leading-relaxed">
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

        <h2 className="text-xl font-semibold text-navy-900 pt-4">
          How it works
        </h2>

        <p>
          Attendees on the programme post insights, notes, and reflections as
          they happen. Observers &mdash; whether colleagues, peers, or anyone
          curious about AI leadership &mdash; can follow along and join the
          conversation through comments.
        </p>

        <p>You&apos;ll find four types of posts here:</p>

        <ul className="space-y-3 pl-1">
          <li className="flex items-start gap-3">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full mt-0.5 shrink-0">
              Live Insight
            </span>
            <span>
              Quick observations captured during or immediately after sessions
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-block bg-navy-100 text-navy-700 text-xs font-medium px-2.5 py-1 rounded-full mt-0.5 shrink-0">
              Formal Notes
            </span>
            <span>
              Structured summaries of key concepts, frameworks, and readings
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-block bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full mt-0.5 shrink-0">
              Key Takeaway
            </span>
            <span>The ideas that stick</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full mt-0.5 shrink-0">
              Reflection
            </span>
            <span>
              How these ideas connect to real-world leadership challenges
            </span>
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-navy-900 pt-4">
          About Riz Iqbal
        </h2>

        <p>
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
