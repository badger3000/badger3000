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

/** Chat — the agent's `articles` intent: the 6 newest. */
export const articlesForChatQuery = defineQuery(`*[_type == "articles" && defined(slug.current)] | order(_createdAt desc) [0...6] {
  title, "slug": slug.current, "excerpt": coalesce(excerpt, ""), "topic": topic->title, "date": _createdAt
}`);
