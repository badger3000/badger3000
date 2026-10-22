import { createClient, type SanityClient } from "@sanity/client";

/**
 * Sanity client for the Astro app.
 *
 * Env names are the Astro-native `PUBLIC_*` ones (see the `env.schema` block in
 * astro.config.mjs). The legacy `NEXT_PUBLIC_*` names are still accepted so the
 * rename can land before the cutover, while the Next app at the repo root keeps
 * running off one set of values in `.env`.
 *
 * Queries live in ./queries.ts, types in ./types.ts.
 */

/** Vite replaces `import.meta.env` at build time; it is undefined under plain node. */
const astroEnv = import.meta.env as unknown as Record<string, string | undefined> | undefined;

/** `astro:env` first, then a legacy alias, then the real shell variable. */
function env(key: string, legacy?: string): string | undefined {
  return astroEnv?.[key] ?? (legacy === undefined ? undefined : process.env[legacy]) ?? process.env[key];
}

export const projectId = env("PUBLIC_SANITY_PROJECT_ID", "NEXT_PUBLIC_SANITY_PROJECT_ID");
export const dataset = env("PUBLIC_SANITY_DATASET", "NEXT_PUBLIC_SANITY_DATASET");
export const apiVersion = env("PUBLIC_SANITY_API_VERSION") ?? "2024-03-09";
export const token = env("SANITY_API_TOKEN");

export const isConfigured = Boolean(projectId && dataset);

/**
 * Drafts are only readable with a token, and the CDN never serves them, so the
 * two decisions are linked: a token in development means "show me drafts".
 * Production always reads published content over the CDN.
 */
const previewDrafts = Boolean(token) && !astroEnv?.PROD && process.env.NODE_ENV !== "production";

const MISSING = [
  "Missing Sanity configuration.",
  "Set these in apps/web/.env (copy .env.example) or the shell:",
  "  PUBLIC_SANITY_PROJECT_ID — your Sanity project id",
  "  PUBLIC_SANITY_DATASET    — dataset name (default: production)",
  "  SANITY_API_TOKEN         — optional, only for draft preview in development",
].join("\n");

let client: SanityClient | undefined;

/** Lazily created so importing this module never breaks a credential-less build. */
export function getClient(): SanityClient {
  if (client) return client;
  if (!projectId || !dataset) throw new Error(MISSING);
  client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: !previewDrafts,
    token: previewDrafts ? token : undefined,
    perspective: previewDrafts ? "drafts" : "published",
    stega: false,
  });
  return client;
}

/**
 * Sanity's image CDN takes query params for width/quality/format, which is all
 * Astro's `<Image>` needs on top of the asset URL.
 */
export function imageUrl(
  assetUrl: string | undefined,
  { width, quality = 80, format = "auto" }: { width?: number; quality?: number; format?: string } = {},
): string | undefined {
  if (!assetUrl) return undefined;
  const url = new URL(assetUrl);
  if (width) url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality));
  url.searchParams.set("auto", format);
  return url.toString();
}