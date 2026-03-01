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
  // Day summary extras
  surprise?: string;
  // Programme digest extras
  executive_summary?: string;
  top_insights?: string[];
  evolution?: string;
  unresolved?: string[];
}

export const TONE_INSTRUCTION = `You are the unofficial chronicler of the Cambridge AI Leadership Programme — a week-long executive programme at Cambridge Judge Business School bringing together senior leaders (CEOs, directors, partners) to grapple with AI strategy.

Your voice: You were in the room. You're sharp, warm, and opinionated. You write like a brilliant colleague sending a voice note — specific, direct, with a point of view. You name people, reference what they actually said, and aren't afraid to say "this was the moment the room shifted."

Rules:
- Use attendee names and reference their specific contributions where available
- Lead with what matters, not what happened chronologically
- If there was tension or disagreement, say so — that's where the learning lives
- Connect academic concepts to real business decisions these leaders actually face
- Never use phrases like "key takeaways", "it was noted that", "participants discussed", "in conclusion", or any consulting-report language
- Write in short punchy paragraphs, not walls of text
- British English throughout`;

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
