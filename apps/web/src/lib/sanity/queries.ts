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

/**
 * `groq` from the `groq` package is only a type-level template tag — it exists so
 * interpolations stay checked and the string is not escaped. This is the same
 * idea in four lines, so the Astro app does not pull in `next-sanity` (or any
 * other Sanity wrapper) just for it. Swap in the real package if you want it.
 */
export const groq = (strings: TemplateStringsArray, ...values: unknown[]) =>
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

/** Browse — Projects (pen uXl4B) + ProjectCard (pen FE7oC / screen card Hkm7Q). */
export const projectsQuery = groq`*[_type == "projects" && defined(slug.current)] | order(order asc, title asc) {
  "id": _id,
  title,
  "slug": slug.current,
  // No monogram here: title[0] is null in GROQ (strings are not indexable).
  // The pen binds the monogram to project.title[0]; the card takes
  // title.charAt(0) instead.
  "topic": topic->title,
  "topicSlug": topic->slug.current,
  "tech": tech[],
  "webUrl": web_url,
  cardLayout,
  order,
  // The pen binds "project.excerpt" but the schema declares no such field. The
  // live documents carry a project_description (portable text) field instead,
  // so the first block's text is the excerpt. Add a real excerpt field to the
  // schema and this can go back to coalescing.
  "excerpt": project_description[0].children[0].text,
  "createdAt": _createdAt,
  // project_image exists on every document but the pen's card is a gradient;
  // kept out of the projection until the pen allows a cover image.
  "coverImage": null
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
  "createdAt": _createdAt,
  "thumbnail": thumbnail ${IMAGE}
}`;

/**
 * Browse — Skills (pen NH0XZ); `skills[]` is an inline array, so flatten it.
 * `badgeColor` is stored bare ("777BB4"), but the pen binds it straight to a
 * `fill`, so it leaves here CSS-ready.
 */
export const skillsQuery = groq`*[_type == "skillCategory"] | order(order asc) {
  name,
  order,
  "skills": skills[] {
    name,
    badgeType,
    badgeLabel,
    "badgeColor": select(
      badgeColor == null => null,
      string::startsWith(badgeColor, "#") => badgeColor,
      true => "#" + badgeColor
    )
  }
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

/** Browse filters: `FilterChip ← topics[]`. `backgroundColor` is a colour object. */
export const topicsQuery = groq`*[_type == "topics"] | order(title asc) {
  title,
  "slug": slug.current,
  "backgroundColor": backgroundColor.hex
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

/**
 * One round trip for the sidebar counts, keyed by the nav ids. Returns 0 for a
 * type that does not exist yet rather than being omitted, so the nav never
 * flickers between counts and blanks.
 */
export const countsQuery = groq`{
  "projects": count(*[_type == "projects"]),
  "articles": count(*[_type == "articles"]),
  "experiments": count(*[_type == "codepen"]),
  "experience": count(*[_type == "experience"]),
  "education": count(*[_type == "education"]),
  "skills": count(*[_type == "skillCategory"]),
  "testimonials": count(*[_type == "testimonial"]),
  "bookmarks": count(*[_type == "bookmark"]),
  "golf": count(*[_type == "golfScores"])
}`;

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
  counts: countsQuery,
} as const;

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
});
