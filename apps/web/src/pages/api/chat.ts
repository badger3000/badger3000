/**
 * POST /api/chat — the agent endpoint (ADR 0008, PRD phase 4).
 *
 *   classify → retrieve (Sanity) → compose (optional Workers AI) → { intent, text, cards[] }
 *
 * Runs on the Worker: `prerender = false` keeps every page static and spends an
 * invocation only here. The response shape is the contract the client renders;
 * `text` is always present because the deterministic phrasing is the floor, not
 * the fallback.
 */
import type { APIRoute } from "astro";
import { classify, type Intent } from "../../lib/agent/intents.ts";
import { filterCards, retrieve } from "../../lib/agent/retrieve.ts";
import { compose, fallback } from "../../lib/agent/compose.ts";

export const prerender = false;

const MAX_MESSAGE = 400;

/** Suggestions for the fallback answer, and the chips under the greeting. */
const SUGGESTIONS = [
  "What has Kyle shipped?",
  "What has he written?",
  "Walk me through his experience",
  "What are his skills?",
  "Show me his golf scores",
];

export interface ChatResponse {
  intent: Intent;
  text: string;
  cards: Awaited<ReturnType<typeof retrieve>>["cards"];
  /** Present on `suggest`, so the client can offer the chips. */
  suggestions?: string[];
  /** Which tier produced `text` — useful in the UI and in logs. */
  composed: "model" | "template";
}

export const POST: APIRoute = async ({ request }) => {
  let message = "";
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { q?: unknown; message?: unknown };
      message = String(body.q ?? body.message ?? "");
    } else {
      // The Composer is a real form, so a plain submit must work too.
      const form = await request.formData();
      message = String(form.get("q") ?? form.get("message") ?? "");
    }
  } catch {
    return json({ error: "Could not read that message." }, 400);
  }

  message = message.trim().slice(0, MAX_MESSAGE);
  if (!message) return json({ error: "Ask something." }, 400);

  const { intent, query } = classify(message);

  if (intent === "suggest") {
    return json({
      intent,
      text: fallback("suggest", 0, []),
      cards: [],
      suggestions: SUGGESTIONS,
      composed: "template",
    } satisfies ChatResponse);
  }

  const found = await retrieve(intent);
  // Narrow to the words the visitor actually typed, but never to nothing.
  const cards = filterCards(found.cards, query);

  // The model's line is a bonus; the template is the contract.
  const line = await compose(intent, found.facts);
  const text = line ?? fallback(intent, found.count, found.facts);

  return json({ intent, text, cards, composed: line ? "model" : "template" } satisfies ChatResponse);
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Answers are derived from content that only changes on a rebuild.
      "cache-control": "no-store",
    },
  });