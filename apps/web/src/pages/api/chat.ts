/**
 * POST /api/chat — the agent endpoint (ADR 0008, PRD phase 4).
 *
 *   classify → retrieve (Sanity) → compose (optional Workers AI) → { intent, text, cards[] }
 *
 * Runs on the Worker: `prerender = false` keeps every page static and spends an
 * invocation only here. The response shape is the contract the client renders;
 * `text` is always present because the deterministic phrasing is the floor, not
 * the fallback.
 *
 *   200  { intent, text, cards, suggestions?, composed }
 *   503  { intent, text, cards: [], composed: "template", degraded: true } — content source failed
 *   429  { error } + Retry-After — rate limited (CHAT_LIMITER)
 *   400 / 405 / 413  { error }
 */
import type { APIRoute } from "astro";
import { CHAT_MODEL_TIER } from "astro:env/server";
import { answer, type ChatResponse } from "../../lib/agent/answer.ts";
import type { AiBinding } from "../../lib/agent/compose.ts";
import { classify } from "../../lib/agent/intents.ts";
import type { ChatFetch } from "../../lib/agent/retrieve.ts";
import { bindings } from "../../lib/agent/bindings.ts";
import { getClient } from "../../lib/sanity/client.ts";
import { json, readBody } from "../../lib/http.ts";

export type { ChatResponse };

export const prerender = false;

const MAX_MESSAGE = 400;
/** A question is a few hundred bytes; anything past this is not a question. */
const MAX_BODY = 2048;

/** Sanity reads for the agent, through the app's one client (lib/sanity/client.ts). */
const fetchFromSanity: ChatFetch = (query, params = {}) => getClient().fetch(query, params);

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export const POST: APIRoute = async ({ request }) => {
  if (await rateLimited(request)) {
    return json({ error: "Slow down — try again in a minute." }, { status: 429, headers: { "retry-after": "60" } });
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY) return tooLarge();
  const bytes = await readBody(request, MAX_BODY);
  if (!bytes) return tooLarge();

  let raw: unknown;
  try {
    // Re-wrap the capped bytes so the platform parses them, whatever the type.
    const capped = new Request(request.url, { method: "POST", headers: request.headers, body: bytes });
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = (await capped.json()) as { q?: unknown; message?: unknown } | null;
      raw = body?.q ?? body?.message;
    } else {
      // The Composer is a real form, so a plain submit must work too.
      const form = await capped.formData();
      raw = form.get("q") ?? form.get("message");
    }
  } catch {
    return json({ error: "Could not read that message." }, { status: 400 });
  }

  if (typeof raw !== "string") return json({ error: "`q` must be a string." }, { status: 400 });
  const message = raw.trim().slice(0, MAX_MESSAGE);
  if (!message) return json({ error: "Ask something." }, { status: 400 });

  try {
    const env = await bindings();
    const model = { tier: CHAT_MODEL_TIER, ai: env?.AI as AiBinding | undefined };
    return json(await answer(message, { fetch: fetchFromSanity, model }) satisfies ChatResponse);
  } catch (error) {
    // A Sanity outage, a 401 or a malformed row: still JSON, still something
    // the visitor can act on.
    console.error("[chat] retrieval failed:", error);
    return json(
      {
        intent: classify(message).intent,
        text: "I can't reach the content right now — browse it instead.",
        cards: [],
        composed: "template",
        degraded: true,
      } satisfies ChatResponse,
      { status: 503 },
    );
  }
};

/** Anything but POST: a JSON 405, not the HTML 404 page. */
export const ALL: APIRoute = () =>
  json({ error: "POST only." }, { status: 405, headers: { allow: "POST" } });

/**
 * 20 a minute per IP (wrangler.jsonc). A missing binding (a Node preview) or a
 * limiter error means no limit rather than no chat.
 */
async function rateLimited(request: Request): Promise<boolean> {
  const limiter = (await bindings())?.CHAT_LIMITER as RateLimiter | undefined;
  if (!limiter) return false;
  try {
    const { success } = await limiter.limit({ key: request.headers.get("cf-connecting-ip") ?? "anon" });
    return !success;
  } catch (error) {
    console.error("[chat] rate limiter failed:", error);
    return false;
  }
}

const tooLarge = () => json({ error: "That message is too long." }, { status: 413 });
