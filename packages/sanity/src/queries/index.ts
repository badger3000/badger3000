/**
 * Every GROQ query the site runs, one file per content type. No client here:
 * callers fetch with their own (`createSanity` from the package root).
 *
 * Two rules, from `docs/runbooks/designing-from-the-pen.md`:
 *
 * 1. **The schema is the source of truth for content.** Field names come from
 *    `src/schema/parts/*.js`, and aliases make the pen's `← field` binding
 *    literally true — e.g. the schema says `web_url`, so we alias it to
 *    `webUrl` rather than renaming content.
 * 2. **References are dereferenced here, not in components.** `topic` is a
 *    reference to `topics`, so every projection resolves `topic->title`.
 *
 * Each is a `defineQuery`, so `sanity typegen` finds it and names its result
 * type (`projectsQuery` → `ProjectsQueryResult` in ../sanity.types.ts).
 */
import { articleCountQuery, countsQuery, projectCountQuery } from "./counts.ts";
import { articlesForChatQuery, articlesQuery } from "./articles.ts";
import { bookmarksForChatQuery, bookmarksQuery } from "./bookmarks.ts";
import {
  educationForChatQuery,
  educationQuery,
  experienceForChatQuery,
  experienceQuery,
} from "./experience.ts";
import { experimentsForChatQuery, experimentsQuery } from "./experiments.ts";
import { golfScoresForChatQuery, golfScoresQuery } from "./golf.ts";
import { projectsForChatQuery, projectsQuery } from "./projects.ts";
import { settingsForChatQuery, settingsQuery } from "./settings.ts";
import { skillsForChatQuery, skillsQuery } from "./skills.ts";
import { testimonialsForChatQuery, testimonialsQuery } from "./testimonials.ts";
import { topicsQuery } from "./topics.ts";
import { feedQuery } from "./feed.ts";

export * from "./articles.ts";
export * from "./bookmarks.ts";
export * from "./counts.ts";
export * from "./experience.ts";
export * from "./experiments.ts";
export * from "./golf.ts";
export * from "./projects.ts";
export * from "./settings.ts";
export * from "./skills.ts";
export * from "./testimonials.ts";
export * from "./topics.ts";

/** Browse views: name → query, one per page's projection. */
export const browseQueries = {
  projects: projectsQuery,
  articles: articlesQuery,
  experiments: experimentsQuery,
  skills: skillsQuery,
  testimonials: testimonialsQuery,
  bookmarks: bookmarksQuery,
  golfScores: golfScoresQuery,
  experience: experienceQuery,
  education: educationQuery,
  topics: topicsQuery,
  settings: settingsQuery,
  counts: countsQuery,
} as const;

/** The agent's retrieval (apps/web/src/lib/agent/retrieve.ts): name → query. */
export const chatQueries = {
  projectsForChat: projectsForChatQuery,
  articlesForChat: articlesForChatQuery,
  experimentsForChat: experimentsForChatQuery,
  experienceForChat: experienceForChatQuery,
  educationForChat: educationForChatQuery,
  skillsForChat: skillsForChatQuery,
  testimonialsForChat: testimonialsForChatQuery,
  bookmarksForChat: bookmarksForChatQuery,
  golfScoresForChat: golfScoresForChatQuery,
  settingsForChat: settingsForChatQuery,
  projectCount: projectCountQuery,
  articleCount: articleCountQuery,
} as const;

/** Every query by name, for linting, parsing and diffing (`sanity:check`). */
export const queries = { ...browseQueries, ...chatQueries, feed: feedQuery } as const;

/** The real `groq` tag and `defineQuery`, for callers that write their own. */
export { default as groq, defineQuery } from "groq";

export * from "./feed.ts";
