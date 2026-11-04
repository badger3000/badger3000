import { defineQuery } from "groq";

/** Browse — Projects (pen uXl4B) + ProjectCard (pen FE7oC / screen card Hkm7Q). */
export const projectsQuery = defineQuery(`*[_type == "projects" && defined(slug.current)] | order(order asc, title asc) {
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
}`);

/**
 * Chat — the agent's `projects` intent, by the schema's `order`. The shape every
 * list intent shares:
 *
 * - `$q`: the visitor's terms as `match` patterns (`["react*"]`); a document
 *   matches when any term hits any listed field. `[]` matches everything.
 * - `$limit`: the most rows one answer carries.
 * - `total` / `matched`: the counts the reply quotes ("2 of his 5 projects"),
 *   so the text is computed from the same filter as the cards.
 */
export const projectsForChatQuery = defineQuery(`{
  "total": count(*[_type == "projects" && defined(slug.current)]),
  "matched": count(*[_type == "projects" && defined(slug.current)
    && (count($q) == 0 || count($q[[^.title, ^.topic->title, ...coalesce(^.tech, [])] match @]) > 0)]),
  "rows": *[_type == "projects" && defined(slug.current)
    && (count($q) == 0 || count($q[[^.title, ^.topic->title, ...coalesce(^.tech, [])] match @]) > 0)]
    | order(order asc) [0...$limit] {
    "title": coalesce(title, "Untitled"), "topic": topic->title, "tech": coalesce(tech, []), "url": web_url
  }
}`);
