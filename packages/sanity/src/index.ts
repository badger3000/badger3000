import { createClient, type SanityClient } from "@sanity/client";

/**
 * The runtime half of @badger3000/sanity: config in, client out. It reads no
 * env and holds no module state, so the Worker, the prerender and plain-node
 * scripts can all share it. Each caller owns its config — apps/web wires it
 * from `astro:env` (src/lib/sanity/client.ts), scripts from `process.env`.
 *
 * Queries live in ./queries, generated result types in ./types, and the Studio
 * schema in ./schema (which pulls in `sanity` and React, so runtime code never
 * imports it).
 */

/** Pinned so a Sanity API bump cannot change a deployed build. */
export const API_VERSION = "2024-03-09";

/**
 * Not secrets: both ship in every browser request to the API. Studio and its
 * CLI read them from here, because a standalone `sanity build` only exposes
 * `SANITY_STUDIO_*` env to the browser.
 */
export const projectId = "57e12m54";
export const dataset = "badger3000";

export interface SanityConfig {
  projectId: string;
  dataset: string;
  /** Defaults to `API_VERSION`. */
  apiVersion?: string;
  /** Viewer token. Server-only: the dataset is private, so every read needs it. */
  token?: string;
  /**
   * The CDN serves a private dataset when the request carries the token
   * (verified against apicdn.sanity.io), so published reads use it by default.
   * Drafts always bypass it — the CDN never serves them.
   */
  useCdn?: boolean;
  /** Defaults to `"published"`; drafts are an explicit opt-in. */
  perspective?: "published" | "drafts";
}

export interface Sanity {
  client: SanityClient;
  /** `client.fetch`; typegen's `SanityQueries` overload types the result from the query string. */
  fetch: SanityClient["fetch"];
  imageUrl: typeof imageUrl;
}

export function createSanity(config: SanityConfig): Sanity {
  const drafts = config.perspective === "drafts";
  const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion ?? API_VERSION,
    useCdn: (config.useCdn ?? true) && !drafts,
    token: config.token,
    perspective: drafts ? "drafts" : "published",
    stega: false,
  });
  return { client, fetch: client.fetch.bind(client) as SanityClient["fetch"], imageUrl };
}

/**
 * Sanity's image CDN takes query params for width/quality/format, which is all
 * Astro's `<Image>` needs on top of the asset URL.
 *
 * With no `format`, the CDN picks the best one the browser accepts
 * (`auto=format`, the only value `auto` takes; anything else is a 400). A
 * `format` (`jpg`, `png`, `webp`) pins it with `fm` instead.
 */
export function imageUrl(
  assetUrl: string | null | undefined,
  { width, quality = 80, format }: { width?: number; quality?: number; format?: "jpg" | "png" | "webp" } = {},
): string | undefined {
  if (!assetUrl) return undefined;
  const url = new URL(assetUrl);
  if (width) url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality));
  if (format) url.searchParams.set("fm", format);
  else url.searchParams.set("auto", "format");
  return url.toString();
}
