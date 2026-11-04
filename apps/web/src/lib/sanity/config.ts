/**
 * The env-free half of the wiring: what counts as configured, and the message
 * when it isn't. ./client.ts (Astro) and scripts/sanity-check.ts (plain node)
 * both use it; the client itself comes from `createSanity` in
 * @badger3000/sanity.
 */

export const MISSING = [
  "Missing Sanity configuration.",
  "Set these in apps/web/.env (copy .env.example) or the shell:",
  "  PUBLIC_SANITY_PROJECT_ID - your Sanity project id",
  "  PUBLIC_SANITY_DATASET    - dataset name (this project uses 'badger3000')",
  "  SANITY_API_TOKEN         - required for a private dataset, and for drafts",
].join("\n");

export const isComplete = (config: { projectId?: string; dataset?: string }) =>
  Boolean(config.projectId && config.dataset);
