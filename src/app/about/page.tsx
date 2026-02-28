export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
        About
      </h1>

      <div className="space-y-5 text-navy-700 leading-relaxed">
        <p>
          Welcome to the Cambridge AI Leadership Programme Live Learning Blog.
          This is a space where I share real-time insights, reflections, and key
          takeaways as I work through the programme.
        </p>

        <p>
          The Cambridge AI Leadership Programme is designed for senior leaders
          navigating the strategic implications of artificial intelligence. It
          brings together rigorous academic thinking with practical leadership
          frameworks, helping participants understand not just what AI can do,
          but how to lead organisations through the transformation it demands.
        </p>

        <h2 className="text-xl font-semibold text-navy-900 pt-4">
          Why this blog?
        </h2>

        <p>
          Learning is deeper when you articulate it. This blog serves as a
          living document of my journey through the programme &mdash; capturing
          ideas as they emerge, before they get polished into corporate
          presentations or forgotten entirely.
        </p>

        <p>You will find four types of posts here:</p>

        <ul className="space-y-3 pl-1">
          <li className="flex items-start gap-3">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full mt-0.5 shrink-0">
              Live Insight
            </span>
            <span>
              Quick observations captured during or immediately after sessions.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-block bg-navy-100 text-navy-700 text-xs font-medium px-2.5 py-1 rounded-full mt-0.5 shrink-0">
              Formal Notes
            </span>
            <span>
              More structured summaries of key concepts, frameworks, and
              readings.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-block bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full mt-0.5 shrink-0">
              Key Takeaway
            </span>
            <span>
              The ideas that stick &mdash; the ones I keep coming back to and
              want to remember.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full mt-0.5 shrink-0">
              Reflection
            </span>
            <span>
              Personal reflections on how these ideas connect to real-world
              leadership challenges.
            </span>
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-navy-900 pt-4">
          About the author
        </h2>

        <p>
          I am a senior leader with a deep interest in how emerging technologies
          reshape organisations, industries, and leadership itself. This
          programme is part of my commitment to staying at the frontier of
          AI-informed strategy and decision-making.
        </p>

        <p className="text-navy-400 text-sm pt-4">
          Comments are open on all posts. I welcome thoughtful responses,
          questions, and alternative perspectives.
        </p>
      </div>
    </div>
  );
}
