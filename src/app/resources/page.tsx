const resources = [
  {
    title: "Generative AI Has a Visual Plagiarism Problem",
    source: "IEEE Spectrum",
    url: "https://spectrum.ieee.org/generative-ai-visual-plagiarism",
    description:
      "Explores how generative AI models can reproduce copyrighted visual styles and the legal implications.",
  },
  {
    title: "The Complex World of Style, Copyright, and Generative AI",
    source: "Creative Commons",
    url: "https://creativecommons.org/2024/01/the-complex-world-of-style-copyright-and-generative-ai/",
    description:
      "Examines the intersection of creative style, copyright law, and AI-generated content.",
  },
  {
    title: "AI 2027",
    source: null,
    url: "https://ai-2027.com",
    description:
      "A scenario-based exploration of how AI capabilities may develop over the next few years.",
  },
];

export default function ResourcesPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">
        Pre-Reading Resources
      </h1>
      <p className="text-txt-secondary mb-8">
        Required reading for the Cambridge AI Leadership Programme.
      </p>

      <div className="space-y-4">
        {resources.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="bg-dark-surface border border-[rgba(255,255,255,0.06)] rounded-xl p-6 card-hover transition-all duration-150">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="font-heading text-lg font-semibold text-txt-primary group-hover:text-accent transition-colors mb-1">
                    {r.title}
                  </h2>
                  {r.source && (
                    <p className="text-sm text-accent/70 mb-2">{r.source}</p>
                  )}
                  <p className="text-txt-secondary text-sm leading-relaxed">
                    {r.description}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-txt-secondary/40 group-hover:text-accent shrink-0 mt-1 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
