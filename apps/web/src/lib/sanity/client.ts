import type { SanityClient } from "@sanity/client";
import {
  PUBLIC_SANITY_API_VERSION,
  PUBLIC_SANITY_DATASET,
  PUBLIC_SANITY_PROJECT_ID,
  PUBLIC_SANITY_USE_CDN,
} from "astro:env/client";
import { SANITY_ALLOW_EMPTY, SANITY_API_TOKEN, SANITY_PREVIEW } from "astro:env/server";
import { MISSING, createSanityClient, isComplete } from "./factory.ts";
import { createQuerySet } from "./queries.ts";

/**
 * Sanity client for the Astro app: ./factory.ts wired from `astro:env`, so the
 * schema in astro.config.mjs actually applies. Astro-only — plain-node scripts
 * build their own client from `process.env` with the same factory.
 *
 * `SANITY_API_TOKEN` is `access: "secret"`: on the Worker it is read per
 * isolate at runtime (`wrangler secret put`), never inlined into the bundle.
 * That only holds while it is read inside `getClient()`, not at module scope.
 *
 * Queries live in ./queries.ts, types in ./types.ts.
 */

export const projectId = PUBLIC_SANITY_PROJECT_ID;
export const dataset = PUBLIC_SANITY_DATASET;
export const apiVersion = PUBLIC_SANITY_API_VERSION;

export const isConfigured = isComplete({ projectId, dataset });

let client: SanityClient | undefined;

/** Lazily created so importing this module never breaks a credential-less build. */
export function getClient(): SanityClient {
  return (client ??= createSanityClient({
    projectId,
    dataset,
    apiVersion,
    token: SANITY_API_TOKEN,
    // Drafts only on an explicit opt-in, never just because a token is present.
    perspective: SANITY_PREVIEW === "drafts" ? "drafts" : "published",
    useCdn: PUBLIC_SANITY_USE_CDN,
  }));
}

/**
 * `SANITY_ALLOW_EMPTY=1` lets a build with no credentials (CI) render every page
 * empty instead of failing. Deploy builds never set it, so a misconfigured
 * deploy still fails loudly.
 */
function run<T>(query: string, empty: T): Promise<T> {
  if (!isConfigured) {
    return SANITY_ALLOW_EMPTY === "1" ? Promise.resolve(empty) : Promise.reject(new Error(MISSING));
  }
  return getClient().fetch<T>(query);
}

export const querySet = createQuerySet(run);

export const {
  projects: getProjects,
  articles: getArticles,
  experiments: getExperiments,
  skills: getSkills,
  testimonials: getTestimonials,
  bookmarks: getBookmarks,
  golfScores: getGolfScores,
  experience: getExperience,
  education: getEducation,
  topics: getTopics,
  settings: getSettings,
  counts: getCounts,
} = querySet;
