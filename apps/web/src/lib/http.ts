/**
 * JSON responses for the Worker endpoints in `src/pages/api/*`.
 *
 * `public/_headers` only applies to static assets, so a Worker response gets
 * none of its policy. Every API response goes through `json()` and carries the
 * same baseline: never cached, never sniffed, no full referrer.
 */
const SECURITY_HEADERS: Record<string, string> = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

/** `init.headers` add to the baseline (e.g. `Allow`, `Retry-After`); they can't override it. */
export function json(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
  return new Response(JSON.stringify(body), { ...init, headers });
}

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

/**
 * Whether this visitor (by IP) is over the Workers rate-limit binding `name`
 * (`ratelimits` in wrangler.jsonc). A missing binding (a Node preview, or
 * `astro dev`) or a limiter error means no limit rather than no endpoint.
 */
export async function rateLimited(name: string, request: Request): Promise<boolean> {
  let limiter: RateLimiter | undefined;
  try {
    const { env } = await import("cloudflare:workers");
    limiter = (env as unknown as Record<string, unknown>)[name] as RateLimiter | undefined;
  } catch {
    return false;
  }
  if (!limiter) return false;
  try {
    const { success } = await limiter.limit({ key: request.headers.get("cf-connecting-ip") ?? "anon" });
    return !success;
  } catch (error) {
    console.error(`[${name}] rate limiter failed:`, error);
    return false;
  }
}

/**
 * The request body as bytes, or null once it passes `limit`. Reads the stream
 * rather than trusting `content-length`, which a client can omit or understate.
 */
export async function readBody(request: Request, limit: number): Promise<Uint8Array<ArrayBuffer> | null> {
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}
