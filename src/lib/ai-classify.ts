import { callClaude } from "./anthropic";

const VALID_CATEGORIES = [
  "Live Insight",
  "Formal Notes",
  "Key Takeaway",
  "Reflection",
];

export async function classifyPost(title: string, body: string): Promise<string> {
  const prompt = `Classify this blog post into exactly ONE category. Return ONLY the category name.

- Live Insight — raw, quick, in-the-moment. Written during or right after a session. Often informal, sometimes incomplete.
- Formal Notes — structured, detailed. Has headings, frameworks, or systematic coverage of concepts.
- Key Takeaway — distilled. The one thing that stuck. Usually short and punchy.
- Reflection — personal. Connects the session to the author's own work, industry, or leadership challenges.

Title: ${title}
Body: ${body}

Category:`;

  const result = (await callClaude("You are a blog post classifier. Return ONLY the category name, nothing else.", prompt)).trim();

  // Validate the result is one of the valid categories
  const matched = VALID_CATEGORIES.find(
    (cat) => cat.toLowerCase() === result.toLowerCase()
  );
  return matched || "Live Insight";
}
