/**
 * Migration script: Converts bookmark folder fields from plain strings
 * to proper bookmarkFolder document references.
 *
 * 1. Reads all bookmarks that have a string folder value
 * 2. Creates bookmarkFolder documents for each unique folder name
 * 3. Patches each bookmark to replace the string with a reference
 *
 * Usage:
 *   node --env-file=../../apps/web/.env scripts/migrate-bookmark-folders.mjs
 *
 * Safe to re-run — skips bookmarks that already have a reference.
 */

import {createClient} from "@sanity/client";

const projectId =
  process.env.PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset =
  process.env.PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET;
const token =
  process.env.SANITY_API_TOKEN ||
  process.env.SANITY_TOKEN;

// No dataset default: this project's dataset is private "badger3000", and a
// guessed name would point writes at a dataset that does not exist. Only the
// missing names are printed, never a value.
const missing = [
  !projectId && "PUBLIC_SANITY_PROJECT_ID (or SANITY_PROJECT_ID)",
  !dataset && "PUBLIC_SANITY_DATASET (or SANITY_DATASET)",
  !token && "SANITY_API_TOKEN (or SANITY_TOKEN)",
].filter(Boolean);
if (missing.length) {
  console.error(
    "Missing required environment variables:\n  " +
      missing.join("\n  ") +
      "\nRun with the app env: node --env-file=../../apps/web/.env scripts/<name>.mjs"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-03-09",
  useCdn: false,
  token,
});

function folderSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Step 1: Fetch all bookmarks with a string folder value ───────────────────
const bookmarks = await client.fetch(
  `*[_type == "bookmark" && defined(folder) && !defined(folder._ref)]{
    _id,
    folder
  }`
);

if (bookmarks.length === 0) {
  console.log("No bookmarks with string folder values found. Nothing to migrate.");
  process.exit(0);
}

console.log(`Found ${bookmarks.length} bookmarks with string folder values to migrate.\n`);

// ── Step 2: Create bookmarkFolder documents ──────────────────────────────────
const uniqueFolders = [...new Set(bookmarks.map((b) => b.folder))].sort();
console.log(`Creating ${uniqueFolders.length} folder documents...`);

const folderTransaction = client.transaction();
const folderIdMap = new Map();

for (const name of uniqueFolders) {
  const id = `bookmarkFolder-${folderSlug(name)}`;
  folderIdMap.set(name, id);
  folderTransaction.createIfNotExists({
    _id: id,
    _type: "bookmarkFolder",
    name,
  });
}

await folderTransaction.commit();
console.log(`  ✓ ${uniqueFolders.length} folders ready\n`);

// ── Step 3: Patch bookmarks to use references ────────────────────────────────
console.log(`Patching ${bookmarks.length} bookmarks...`);

const BATCH_SIZE = 200;
let patched = 0;

for (let i = 0; i < bookmarks.length; i += BATCH_SIZE) {
  const batch = bookmarks.slice(i, i + BATCH_SIZE);
  const transaction = client.transaction();

  for (const bookmark of batch) {
    const folderId = folderIdMap.get(bookmark.folder);
    transaction.patch(bookmark._id, {
      set: {
        folder: {
          _type: "reference",
          _ref: folderId,
        },
      },
    });
  }

  await transaction.commit();
  patched += batch.length;
  console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: patched ${batch.length} bookmarks (${patched}/${bookmarks.length})`);
}

console.log(`\n✓ Done! Migrated ${patched} bookmarks across ${uniqueFolders.length} folders.`);
