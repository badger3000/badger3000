// apps/studio/structure/bookmarkStructure.ts
import type {StructureResolver} from "sanity/structure";
import {API_VERSION} from "@badger3000/sanity";

export const bookmarkStructure: StructureResolver = (S, context) => {
  // All default items except bookmark and bookmarkFolder (handled manually below); golfProfile is a singleton
  const defaultItems = S.documentTypeListItems().filter(
    (item) => !["bookmark", "bookmarkFolder", "golfProfile"].includes(item.getId() ?? "")
  );

  const bookmarksItem = S.listItem()
    .title("Bookmarks")
    .child(async () => {
      try {
        const client = context.getClient({apiVersion: API_VERSION});
        const result = await client.fetch(
          `*[_type == "bookmarkFolder"] | order(name asc) { _id, name }`
        );

        const folderItems = result.map((f: {_id: string; name: string}) =>
          S.listItem()
            .title(f.name)
            .id(f._id)
            .child(
              S.documentList()
                .title(f.name)
                .filter(`_type == "bookmark" && folder._ref == $folderId`)
                .params({folderId: f._id})
                .defaultOrdering([{field: "title", direction: "asc"}])
            )
        );

        return S.list().title("Bookmarks").items([
          S.documentTypeListItem("bookmark").title("All Bookmarks"),
          S.documentTypeListItem("bookmarkFolder").title("Bookmark Folders"),
          S.divider(),
          ...folderItems,
        ]);
      } catch (err) {
        console.error("Error fetching folders:", err);
        return S.list().title("Bookmarks").items([
          S.documentTypeListItem("bookmark").title("All Bookmarks"),
          S.documentTypeListItem("bookmarkFolder").title("Bookmark Folders"),
        ]);
      }
    });

  // Singleton: one fixed document id, no list and no "create new".
  const golfProfileItem = S.listItem()
    .title("Golf Profile")
    .id("golfProfile")
    .child(S.document().schemaType("golfProfile").documentId("golfProfile"));

  return S.list().title("Content").items([...defaultItems, bookmarksItem, golfProfileItem]);
};