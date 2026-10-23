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

/** Chat — the agent's `projects` intent: the first 8, by the schema's `order`. */
export const projectsForChatQuery = defineQuery(`*[_type == "projects" && defined(slug.current)] | order(order asc) [0...8] {
  "title": coalesce(title, "Untitled"), "topic": topic->title, "tech": coalesce(tech, []), "url": web_url
}`);
