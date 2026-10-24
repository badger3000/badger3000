import { defineQuery } from "groq";

/** Browse — Bookmarks (pen fjLXc). */
export const bookmarksQuery = defineQuery(`*[_type == "bookmark"] | order(title asc) {
  "id": _id,
  title,
  url,
  "folder": folder->name
}`);

/** Chat — the agent's `bookmarks` intent: matched on title, URL and folder, by title. */
export const bookmarksForChatQuery = defineQuery(`{
  "total": count(*[_type == "bookmark"]),
  "matched": count(*[_type == "bookmark"
    && (count($q) == 0 || count($q[[^.title, ^.url, ^.folder->name] match @]) > 0)]),
  "rows": *[_type == "bookmark"
    && (count($q) == 0 || count($q[[^.title, ^.url, ^.folder->name] match @]) > 0)]
    | order(title asc) [0...$limit] {
    title, url, "folder": folder->name
  }
}`);
