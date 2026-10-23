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

/** Chat — the agent's `experiments` intent: the 6 newest pens. */
export const experimentsForChatQuery = defineQuery(`*[_type == "codepen" && defined(slug.current)] | order(_createdAt desc) [0...6] {
  title, "slug": slug.current, "excerpt": coalesce(excerpt, ""), "url": penUrl, "topic": topic->title
}`);
