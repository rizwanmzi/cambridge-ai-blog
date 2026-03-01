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
    <div className="max-w-[720px] mx-auto">
      <h1 className="text-lg font-semibold text-white mb-1">Pre-Reading Resources</h1>
      <p className="text-[13px] text-txt-tertiary mb-6">
        Required reading for the Cambridge AI Leadership Programme.
      </p>

      <div className="divide-y divide-[rgba(255,255,255,0.06)]">
        {resources.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block py-3 group hover:bg-[rgba(255,255,255,0.03)] -mx-3 px-3 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-medium text-txt-primary group-hover:text-white transition-colors">
                  {r.title}
                </h2>
                <p className="text-[13px] text-txt-tertiary mt-0.5 leading-relaxed">
                  {r.description}
                </p>
                {r.source && (
                  <span className="text-[12px] text-txt-tertiary mt-1 inline-block">{r.source}</span>
                )}
              </div>
              <svg
                className="w-4 h-4 text-txt-tertiary group-hover:text-txt-secondary shrink-0 mt-0.5 transition-colors"
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
          </a>
        ))}
      </div>
    </div>
  );
}
