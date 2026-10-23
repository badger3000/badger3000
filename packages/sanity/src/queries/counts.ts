import { defineQuery } from "groq";

/**
 * One round trip for the sidebar counts, keyed by the nav ids. Returns 0 for a
 * type that does not exist yet rather than being omitted, so the nav never
 * flickers between counts and blanks.
 */
export const countsQuery = defineQuery(`{
  "projects": count(*[_type == "projects"]),
  "articles": count(*[_type == "articles"]),
  "experiments": count(*[_type == "codepen"]),
  "experience": count(*[_type == "experience"]),
  "education": count(*[_type == "education"]),
  "skills": count(*[_type == "skillCategory"]),
  "testimonials": count(*[_type == "testimonial"]),
  "bookmarks": count(*[_type == "bookmark"]),
  "golf": count(*[_type == "golfScores"])
}`);

/** Chat — the `about` intent's two counts. */
export const projectCountQuery = defineQuery(`count(*[_type == "projects"])`);
export const articleCountQuery = defineQuery(`count(*[_type == "articles"])`);
