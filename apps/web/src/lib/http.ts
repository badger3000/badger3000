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
