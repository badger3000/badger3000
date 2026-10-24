import type {
  Article,
  Bookmark,
  EducationEntry,
  ExperienceEntry,
  Experiment,
  GolfScore,
  Project,
  SiteSettings,
  SkillCategory,
  Testimonial,
  Topic,
} from "./types.ts";
import type { FeedQueryResult } from "@badger3000/sanity/types";
import {
  articlesQuery,
  bookmarksQuery,
  browseQueries,
  countsQuery,
  educationQuery,
  experienceQuery,
  experimentsQuery,
  feedQuery,
  golfScoresQuery,
  projectsQuery,
  settingsQuery,
  skillsQuery,
  testimonialsQuery,
  topicsQuery,
} from "@badger3000/sanity/queries";

/**
 * The browse views' GROQ, one projection per page in `design/badger3000v2.pen`.
 * The queries themselves live in @badger3000/sanity (`src/queries/`, one file
 * per content type, with the schema rules that shape them); this module
 * re-exports them under the names the pages already use and binds them to a
 * runner.
 */

export {
  articlesQuery,
  bookmarksQuery,
  countsQuery,
  educationQuery,
  experienceQuery,
  experimentsQuery,
  golfScoresQuery,
  groq,
  projectsQuery,
  settingsQuery,
  skillsQuery,
  testimonialsQuery,
  topicsQuery,
} from "@badger3000/sanity/queries";

/** name → query string for the browse views. The agent's live in the package's `chatQueries`. */
export const queries = browseQueries;

/** Runs one query, or resolves `empty` when a credential-less build allows it. */
export type Run = <T>(query: string, empty: T) => Promise<T>;

/**
 * name → getter, bound to a runner. The Astro wiring (./client.ts) and plain-node
 * scripts each supply their own, so this module never reads env.
 */
export const createQuerySet = (run: Run) => ({
  projects: () => run<Project[]>(projectsQuery, []),
  articles: () => run<Article[]>(articlesQuery, []),
  experiments: () => run<Experiment[]>(experimentsQuery, []),
  skills: () => run<SkillCategory[]>(skillsQuery, []),
  testimonials: () => run<Testimonial[]>(testimonialsQuery, []),
  bookmarks: () => run<Bookmark[]>(bookmarksQuery, []),
  golfScores: () => run<GolfScore[]>(golfScoresQuery, []),
  experience: () => run<ExperienceEntry[]>(experienceQuery, []),
  education: () => run<EducationEntry[]>(educationQuery, []),
  topics: () => run<Topic[]>(topicsQuery, []),
  settings: () => run<SiteSettings | null>(settingsQuery, null),
  counts: () => run<Record<string, number>>(countsQuery, {}),
  /** The RSS feeds (src/lib/feed.ts). */
  feed: () => run<FeedQueryResult>(feedQuery, []),
});
