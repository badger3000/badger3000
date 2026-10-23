/**
 * The whole agent pipeline for one message (ADR 0008):
 *
 *   classify → retrieve (Sanity) → compose (optional model) → { intent, text, cards[] }
 *
 * Env-free: the endpoint (src/pages/api/chat.ts) passes in the Sanity fetch and
 * the model tier, and `agent:check` passes stubs, so both run exactly this.
 * Retrieval errors propagate; turning them into a 503 is the endpoint's job.
 */
import { classify, type Intent } from "./intents.ts";
import { filterCards, retrieve, type Card, type ChatFetch } from "./retrieve.ts";
import { compose, fallback, type Model } from "./compose.ts";

/** Suggestions for the fallback answer, and the chips under the greeting. */
export const SUGGESTIONS = [
  "What has Kyle shipped?",
  "What has he written?",
  "Walk me through his experience",
  "What are his skills?",
  "Show me his golf scores",
];

export interface ChatResponse {
  intent: Intent;
  text: string;
  cards: Card[];
  /** Present on `suggest`, so the client can offer the chips. */
  suggestions?: string[];
  /** Which tier produced `text` — useful in the UI and in logs. */
  composed: "model" | "template";
  /** Set on a 503: Sanity failed, and `text` says so in visitor-facing words. */
  degraded?: true;
}

export interface AnswerDeps {
  fetch: ChatFetch;
  model: Model;
}

export async function answer(message: string, { fetch, model }: AnswerDeps): Promise<ChatResponse> {
  const { intent, query } = classify(message);

  if (intent === "suggest") {
    return {
      intent,
      text: fallback("suggest", 0, []),
      cards: [],
      suggestions: SUGGESTIONS,
      composed: "template",
    };
  }

  const found = await retrieve(intent, fetch);
  // Narrow to the words the visitor actually typed, but never to nothing.
  const cards = filterCards(found.cards, query);

  // The model's line is a bonus; the template is the contract.
  const line = await compose(intent, found.facts, model);
  const text = line ?? fallback(intent, found.count, found.facts);

  return { intent, text, cards, composed: line ? "model" : "template" };
}
