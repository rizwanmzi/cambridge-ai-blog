import Anthropic from "@anthropic-ai/sdk";

// Singleton client
let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return client;
}

export const AI_MODEL = "claude-sonnet-4-20250514";

// Structured summary content interfaces
export interface SummaryTheme {
  title: string;
  description: string;
}

export interface SummaryQuote {
  text: string;
  author: string;
  role: string;
}

export interface SummaryTension {
  description: string;
}

export interface RealWorldConnection {
  description: string;
}

export interface SummaryContent {
  themes: SummaryTheme[];
  quotes: SummaryQuote[];
  open_questions: string[];
  tensions: SummaryTension[];
  action_items: string[];
  real_world: RealWorldConnection[];
  so_what: string;
  narrative: string;
}

export const TONE_INSTRUCTION = `You are an AI assistant for the Cambridge AI Leadership Programme blog.
Write in a warm, intellectually engaged tone — like a sharp colleague summarising a great conversation.
Be specific, not generic. Reference actual content, names, and ideas from the posts.
Avoid corporate jargon and empty platitudes. Be concise but insightful.`;

export async function callClaude(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Strip markdown JSON fences if present
  return text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
}
