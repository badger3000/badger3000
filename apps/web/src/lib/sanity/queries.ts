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
import { getClient } from "./client.ts";

/**
 * `groq` from the `groq` package is only a type-level template tag — it exists so
 * interpolations stay checked and the string is not escaped. This is the same
 * idea in four lines, so the Astro app does not pull in `next-sanity` (or any
 * other Sanity wrapper) just for it. Swap in the real package if you want it.
 */
const groq = (strings: TemplateStringsArray, ...values: unknown[]) =>
  String.raw({ raw: strings }, ...values);

/**
 * GROQ projections, one per browse view in `design/badger3000v2.pen`.
 *
 * Two rules, from `docs/runbooks/designing-from-the-pen.md`:
 *
 * 1. **The schema is the source of truth for content.** Field names come from
 *    `schemas/parts/*.js`, and aliases make the pen's `← field` binding literally
 *    true — e.g. the schema says `web_url`, so we alias it to `webUrl` rather
 *    than renaming content.
 * 2. **References are dereferenced here, not in components.** `topic` is a
 *    reference to `topics`, so every projection resolves `topic->title`.
 */

const IMAGE = `{
  alt,
  "asset": asset->{ _id, url, metadata { dimensions { width, height, aspectRatio } } }
}`;

/** Browse — Projects (pen uXl4B) + ProjectCard (pen FE7oC). */
export const projectsQuery = groq`*[_type == "projects" && defined(slug.current)] | order(order asc, title asc) {
  "id": _id,
  title,
  "slug": slug.current,
  "monogram": title[0],
  "topic": topic->title,
  "topicSlug": topic->slug.current,
  "tech": tech[],
  "webUrl": web_url,
  cardLayout,
  order
}`;

/** Browse — Articles (pen Wmn35). */
export const articlesQuery = groq`*[_type == "articles" && defined(slug.current)] | order(_createdAt desc) {
  "id": _id,
  title,
  "slug": slug.current,
  "excerpt": coalesce(excerpt, "Read more..."),
  "topic": topic->title,
  "publishedAt": _createdAt,
  "mainImage": main_image ${IMAGE}
}`;

/** Browse — Experiments (pen fDntQ); `codepen` documents. */
export const experimentsQuery = groq`*[_type == "codepen" && defined(slug.current)] | order(_createdAt desc) {
  "id": _id,
  title,
  "slug": slug.current,
  "excerpt": coalesce(excerpt, description[0].children[0].text, "Read more..."),
  "topic": topic->title,
  penUrl,
  cardLayout,
  "thumbnail": thumbnail ${IMAGE}
}`;

/** Browse — Skills (pen NH0XZ); `skills[]` is an inline array, so flatten it. */
export const skillsQuery = groq`*[_type == "skillCategory"] | order(order asc) {
  name,
  order,
  "skills": skills[] { name, badgeType, badgeLabel, badgeColor }
}`;

/** Browse — Testimonials (pen xTK4z). */
export const testimonialsQuery = groq`*[_type == "testimonial"] | order(order asc) {
  name,
  role,
  company,
  profileUrl,
  content,
  order,
  featured,
  "photo": photo ${IMAGE}
}`;

/** Browse — Bookmarks (pen fjLXc). */
export const bookmarksQuery = groq`*[_type == "bookmark"] | order(title asc) {
  "id": _id,
  title,
  url,
  "folder": folder->name
}`;

/** Browse — Golf (pen oH8H5): `table · rounds`, newest first. */
export const golfScoresQuery = groq`*[_type == "golfScores"] | order(date desc) {
  course,
  date,
  score
}`;

/** Browse — Experience (pen QTqA7): timeline plus education. */
export const experienceQuery = groq`*[_type == "experience"] | order(startDate desc) {
  title,
  company,
  companyUrl,
  location,
  startDate,
  endDate,
  description,
  order,
  "logo": logo ${IMAGE}
}`;

export const educationQuery = groq`*[_type == "education"] | order(startDate desc) {
  degree,
  institution,
  institutionUrl,
  location,
  startDate,
  endDate,
  description,
  order,
  "logo": logo ${IMAGE}
}`;

/** Browse filters: `FilterChip ← topics[]`. */
export const topicsQuery = groq`*[_type == "topics"] | order(title asc) {
  title,
  "slug": slug.current,
  backgroundColor
}`;

/** `AvatarUser ← settings.name`, and the profile card in the sidebar. */
export const settingsQuery = groq`*[_type == "settings"][0] {
  name,
  title,
  location,
  occupation,
  description,
  "avatarImage": avatar_image ${IMAGE},
  "links": links[]->{ siteName, webUrl }
}`;

export const getProjects = () => getClient().fetch<Project[]>(projectsQuery);
export const getArticles = () => getClient().fetch<Article[]>(articlesQuery);
export const getExperiments = () => getClient().fetch<Experiment[]>(experimentsQuery);
export const getSkills = () => getClient().fetch<SkillCategory[]>(skillsQuery);
export const getTestimonials = () => getClient().fetch<Testimonial[]>(testimonialsQuery);
export const getBookmarks = () => getClient().fetch<Bookmark[]>(bookmarksQuery);
export const getGolfScores = () => getClient().fetch<GolfScore[]>(golfScoresQuery);
export const getExperience = () => getClient().fetch<ExperienceEntry[]>(experienceQuery);
export const getEducation = () => getClient().fetch<EducationEntry[]>(educationQuery);
export const getTopics = () => getClient().fetch<Topic[]>(topicsQuery);
export const getSettings = () => getClient().fetch<SiteSettings | null>(settingsQuery);

/** name → query string, for linting, parsing and diffing the projections. */
export const queries = {
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
} as const;

/** name → getter. Scripts and tests iterate this instead of the queries themselves. */
export const querySet = {
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
} as const;