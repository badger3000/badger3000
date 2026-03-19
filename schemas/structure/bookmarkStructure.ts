// schemas/structure/bookmarkStructure.ts
import type {StructureResolver} from "sanity/structure";

// Using a function resolver that's more compatible
export const bookmarkStructure: StructureResolver = (S, context) => {
  // Try to fetch folders - if it fails, show basic structure
  const folders: Array<{_id: string; name: string}> = [];

  // Try synchronous first, then async
  try {
    // This might work in some versions
    const client = context.getClient({apiVersion: "2024-01-01"});
    // We can't do sync fetch, but we can build the structure
  } catch (e) {
    // Ignore errors
  }

  // Build basic structure
  const list = S.list().title("Content").items([
    S.documentTypeListItem("article").title("Articles"),
    S.documentTypeListItem("codepen").title("CodePens"),
    S.documentTypeListItem("bookmarkFolder").title("Bookmark Folders"),
    // Use a list item with resolver for dynamic content
    S.listItem()
      .title("Bookmarks")
      .child(async () => {
        try {
          const client = context.getClient({apiVersion: "2024-01-01"});
          const result = await client.fetch(
            `*[_type == "bookmarkFolder"] | order(name asc) { _id, name }`
          );

          const folderItems = result.map((f: {_id: string; name: string}) =>
            S.documentTypeListItem("bookmark")
              .title(f.name)
              .filter(`_type == "bookmark" && references("${f._id}")`)
          );

          return S.list().title("Bookmarks").items([
            S.documentTypeListItem("bookmark").title("All Bookmarks"),
            S.divider(),
            ...folderItems,
          ]);
        } catch (err) {
          console.error("Error fetching folders:", err);
          return S.list().title("Bookmarks").items([
            S.documentTypeListItem("bookmark").title("All Bookmarks"),
          ]);
        }
      }),
  ]);

  return list;
};