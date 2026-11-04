/**
 * Workers bindings (`AI`, `CHAT_LIMITER`), or null off-Workers (a Node preview,
 * for instance). Adapter 14 removed `Astro.locals.runtime.env`; bindings come
 * from `cloudflare:workers`, imported dynamically so a missing runtime
 * degrades to "no bindings" instead of crashing.
 */
export async function bindings(): Promise<Record<string, unknown> | null> {
  try {
    const workers = await import("cloudflare:workers");
    return workers.env as unknown as Record<string, unknown>;
  } catch {
    return null;
  }
}
