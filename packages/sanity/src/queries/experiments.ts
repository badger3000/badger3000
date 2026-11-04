import { defineQuery } from "groq";
import { IMAGE } from "./fragments.ts";

/** Browse — Experiments (pen fDntQ); `codepen` documents. */
export const experimentsQuery = defineQuery(`*[_type == "codepen" && defined(slug.current)] | order(_createdAt desc) {
  "id": _id,
  title,
  "slug": slug.current,
  "excerpt": coalesce(excerpt, description[0].children[0].text, "Read more..."),
  "topic": topic->title,
  penUrl,
  cardLayout,
  "createdAt": _createdAt,
  "thumbnail": thumbnail ${IMAGE}
}`);

/** Chat — the agent's `experiments` intent: the newest pens, matched on title, topic and excerpt. */
export const experimentsForChatQuery = defineQuery(`{
  "total": count(*[_type == "codepen" && defined(slug.current)]),
  "matched": count(*[_type == "codepen" && defined(slug.current)
    && (count($q) == 0 || count($q[[^.title, ^.topic->title, ^.excerpt] match @]) > 0)]),
  "rows": *[_type == "codepen" && defined(slug.current)
    && (count($q) == 0 || count($q[[^.title, ^.topic->title, ^.excerpt] match @]) > 0)]
    | order(_createdAt desc) [0...$limit] {
    title, "slug": slug.current, "excerpt": coalesce(excerpt, ""), "url": penUrl, "topic": topic->title
  }
}`);
