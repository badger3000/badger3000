import { defineQuery } from "groq";

/**
 * RSS — `/rss.xml` and `/api/articles-feed` (the README workflow reads the
 * second). Articles and pens, newest 10, as in the Next route. `type` picks the
 * detail route (`/articles/{slug}` or `/codepen/{slug}`); the host is added by
 * the caller from `site`. Drafts never reach a feed, even in draft preview.
 */
export const feedQuery = defineQuery(`*[_type in ["articles", "codepen"] && defined(slug.current) && !(_id in path("drafts.**"))] | order(_createdAt desc) [0...10] {
  "type": _type,
  "title": coalesce(title, "Untitled"),
  "slug": slug.current,
  excerpt,
  "publishedAt": _createdAt
}`);
