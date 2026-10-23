import { defineQuery } from "groq";

/** Browse — Bookmarks (pen fjLXc). */
export const bookmarksQuery = defineQuery(`*[_type == "bookmark"] | order(title asc) {
  "id": _id,
  title,
  url,
  "folder": folder->name
}`);

/** Chat — the agent's `bookmarks` intent: the first 8 by title. */
export const bookmarksForChatQuery = defineQuery(`*[_type == "bookmark"] | order(title asc) [0...8] {
  title, url, "folder": folder->name
}`);
