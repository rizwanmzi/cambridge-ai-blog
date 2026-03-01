import { callClaude } from "./anthropic";

const VALID_CATEGORIES = [
  "Live Insight",
  "Formal Notes",
  "Key Takeaway",
  "Reflection",
];

export async function classifyPost(title: string, body: string): Promise<string> {
  const prompt = `Classify this blog post into exactly one category based on its content. Return ONLY the category name, nothing else.

Categories:
- Live Insight — short, in-the-moment observations captured during or right after a session
- Formal Notes — structured summaries with frameworks, concepts, or detailed breakdowns
- Key Takeaway — the one idea that stuck, a distilled lesson
- Reflection — connecting what was discussed to real-world leadership or business decisions

Post title: ${title}
Post body: ${body}`;

  const result = (await callClaude("You are a blog post classifier. Return ONLY the category name.", prompt)).trim();

  // Validate the result is one of the valid categories
  const matched = VALID_CATEGORIES.find(
    (cat) => cat.toLowerCase() === result.toLowerCase()
  );
  return matched || "Live Insight";
}
