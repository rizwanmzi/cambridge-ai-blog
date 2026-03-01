// AI summary types — shared between server and client components.
// Kept separate from anthropic.ts to avoid bundling the Anthropic SDK on the client.

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
  surprise?: string;
  executive_summary?: string;
  top_insights?: string[];
  evolution?: string;
  unresolved?: string[];
}
