/**
 * A per-isolate memo around the agent's Sanity reads (finding #11).
 *
 * The same few questions come in over and over, and published content changes
 * rarely, so one read answers every repeat for `ttlMs`. Keyed by query and
 * params; the promise is stored, so concurrent repeats share one request, and a
 * failed read is dropped at once rather than cached. Bounded, because the
 * visitor's terms are part of the key.
 *
 * Published perspective only: the endpoint bypasses it when drafts are on, so
 * a preview always shows the edit just made.
 */
import type { ChatFetch } from "./retrieve.ts";

export interface MemoOptions {
  /** How long an answer is reused. */
  ttlMs?: number;
  /** Most entries kept; the oldest goes first. */
  max?: number;
  /** For tests. */
  now?: () => number;
}

export function memoize(fetch: ChatFetch, { ttlMs = 60_000, max = 200, now = Date.now }: MemoOptions = {}): ChatFetch {
  const entries = new Map<string, { at: number; value: Promise<unknown> }>();

  return <T>(query: string, params: Record<string, unknown> = {}): Promise<T> => {
    const key = `${query}\u0000${JSON.stringify(params)}`;
    const hit = entries.get(key);
    if (hit && now() - hit.at < ttlMs) return hit.value as Promise<T>;
    entries.delete(key);

    const value = fetch<T>(query, params);
    entries.set(key, { at: now(), value });
    value.catch(() => entries.get(key)?.value === value && entries.delete(key));
    while (entries.size > max) entries.delete(entries.keys().next().value!);
    return value;
  };
}
