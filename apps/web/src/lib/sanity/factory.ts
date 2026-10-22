import { createClient, type SanityClient } from "@sanity/client";

/**
 * The pure half of the Sanity client: config in, client out. It reads no env
 * and holds no module state, so the Worker, the prerender and plain-node
 * scripts (`scripts/sanity-check.ts`) can all share it. The Astro wiring, which
 * reads `astro:env`, is ./client.ts.
 */

/** Pinned so a Sanity API bump cannot change a deployed build. */
export const API_VERSION = "2024-03-09";

export interface SanityConfig {
  projectId?: string;
  dataset?: string;
  apiVersion?: string;
  /** Viewer token. Server-only: the dataset is private, so every read needs it. */
  token?: string;
  /**
   * The CDN serves a private dataset when the request carries the token
   * (verified against apicdn.sanity.io), so published reads use it. Drafts
   * always bypass it — the CDN never serves them.
   */
  useCdn?: boolean;
  perspective?: "published" | "drafts";
}

export const MISSING = [
  "Missing Sanity configuration.",
  "Set these in apps/web/.env (copy .env.example) or the shell:",
  "  PUBLIC_SANITY_PROJECT_ID - your Sanity project id",
  "  PUBLIC_SANITY_DATASET    - dataset name (this project uses 'badger3000')",
  "  SANITY_API_TOKEN         - required for a private dataset, and for drafts",
].join("\n");

export const isComplete = (config: SanityConfig) => Boolean(config.projectId && config.dataset);

/** Throws `MISSING` when the project id or dataset is absent. */
export function createSanityClient(config: SanityConfig): SanityClient {
  const { projectId, dataset } = config;
  if (!projectId || !dataset) throw new Error(MISSING);
  const drafts = config.perspective === "drafts";
  return createClient({
    projectId,
    dataset,
    apiVersion: config.apiVersion ?? API_VERSION,
    useCdn: (config.useCdn ?? true) && !drafts,
    token: config.token,
    perspective: drafts ? "drafts" : "published",
    stega: false,
  });
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
