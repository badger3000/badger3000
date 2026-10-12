// schemas/structure/bookmarkStructure.ts
import type {SanityClient} from "@sanity/client";
import type {StructureResolver} from "sanity/structure";

type Folder = {_id: string; name: string};

const FOLDER_QUERY = `*[_type == "bookmarkFolder"] | order(name asc) { _id, name }`;
const CACHE_TTL_MS = 60_000; // 1 minute

let cachedFolders: Folder[] = [];
let cacheExpiresAt = 0;
let inflight: Promise<Folder[]> | null = null;

async function fetchFolders(client: SanityClient): Promise<Folder[]> {
  // Return cached data immediately if still fresh
  if (cachedFolders.length && Date.now() < cacheExpiresAt) return cachedFolders;

  // Deduplicate concurrent calls
  if (!inflight) {
    inflight = client
      .fetch<Folder[]>(FOLDER_QUERY)
      .then((result) => {
        cachedFolders = result;
        cacheExpiresAt = Date.now() + CACHE_TTL_MS;
        return result;
      })
      .finally(() => {
        inflight = null;
      });
  }

  // Return stale data immediately while the refresh runs in the background
  if (cachedFolders.length) return cachedFolders;

  return inflight;
}

export const bookmarkStructure: StructureResolver = (S, context) => {
  const defaultItems = S.documentTypeListItems().filter(
    (item) => !["bookmark", "bookmarkFolder"].includes(item.getId() ?? "")
  );

  const bookmarksItem = S.listItem()
    .title("Bookmarks")
    .child(async () => {
      try {
        const client = context.getClient({apiVersion: "2024-01-01"});
        const folders = await fetchFolders(client);

        const folderItems = folders.map((f) =>
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
        console.error("Error fetching bookmark folders:", err);
        return S.list().title("Bookmarks").items([
          S.documentTypeListItem("bookmark").title("All Bookmarks"),
          S.documentTypeListItem("bookmarkFolder").title("Bookmark Folders"),
        ]);
      }
    });

  return S.list().title("Content").items([...defaultItems, bookmarksItem]);
};