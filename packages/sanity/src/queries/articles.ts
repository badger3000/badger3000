import { defineQuery } from "groq";
import { IMAGE } from "./fragments.ts";

/** Browse — Articles (pen Wmn35). */
export const articlesQuery = defineQuery(`*[_type == "articles" && defined(slug.current)] | order(_createdAt desc) {
  "id": _id,
  title,
  "slug": slug.current,
  "excerpt": coalesce(excerpt, "Read more..."),
  "topic": topic->title,
  "publishedAt": _createdAt,
  "mainImage": main_image ${IMAGE}
}`);

/**
 * Chat — the agent's `articles` intent: the newest `$limit` whose title, topic
 * or excerpt match any of `$q` (every article when `$q` is empty), plus the
 * counts the reply quotes. Same shape for every list intent; see projects.ts.
 */
export const articlesForChatQuery = defineQuery(`{
  "total": count(*[_type == "articles" && defined(slug.current)]),
  "matched": count(*[_type == "articles" && defined(slug.current)
    && (count($q) == 0 || count($q[[^.title, ^.topic->title, ^.excerpt] match @]) > 0)]),
  "rows": *[_type == "articles" && defined(slug.current)
    && (count($q) == 0 || count($q[[^.title, ^.topic->title, ^.excerpt] match @]) > 0)]
    | order(_createdAt desc) [0...$limit] {
    "title": coalesce(title, "Untitled"), "slug": slug.current, "excerpt": coalesce(excerpt, ""), "topic": topic->title, "date": _createdAt
  }
}`);
