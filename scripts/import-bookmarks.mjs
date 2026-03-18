/**
 * Migration script: Import bookmarks from static JSON into Sanity CMS.
 *
 * Creates bookmarkFolder documents for each unique folder, then imports
 * all bookmarks with references to their folder document.
 *
 * Usage:
 *   SANITY_PROJECT_ID=xxx SANITY_DATASET=production SANITY_TOKEN=xxx node scripts/import-bookmarks.mjs
 *
 * Or with .env.local vars already loaded:
 *   node --env-file=.env.local scripts/import-bookmarks.mjs
 *
 * Requires a Sanity API token with write permissions.
 * Safe to re-run — uses createIfNotExists with deterministic IDs.
 */

import {createClient} from "@sanity/client";
import {readFileSync} from "fs";
import {fileURLToPath} from "url";
import {dirname, join} from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Support both direct env vars and NEXT_PUBLIC_ prefixed ones
const projectId =
  process.env.SANITY_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset =
  process.env.SANITY_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  "production";
const token =
  process.env.SANITY_TOKEN ||
  process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing required environment variables.\n" +
      "Set SANITY_PROJECT_ID (or NEXT_PUBLIC_SANITY_PROJECT_ID) and SANITY_TOKEN (or SANITY_API_TOKEN).\n" +
      "The token must have write permissions."
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

const bookmarksPath = join(__dirname, "..", "data", "bookmarks.json");
const bookmarks = JSON.parse(readFileSync(bookmarksPath, "utf-8"));

// Build a slug-safe ID from a folder name
function folderSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Step 1: Create folder documents ──────────────────────────────────────────
const uniqueFolders = [...new Set(bookmarks.map((b) => b.folder))].sort();
const folderIdMap = new Map(); // folder name → Sanity _id

console.log(`Creating ${uniqueFolders.length} bookmark folders...`);

const folderTransaction = client.transaction();
for (const name of uniqueFolders) {
  const id = `bookmarkFolder-${folderSlug(name)}`;
  folderIdMap.set(name, id);
  folderTransaction.createIfNotExists({
    _id: id,
    _type: "bookmarkFolder",
    name,
  });
}

try {
  await folderTransaction.commit();
  console.log(`  ✓ ${uniqueFolders.length} folders created\n`);
} catch (err) {
  console.error("  ✗ Failed to create folders:", err.message);
  process.exit(1);
}

// ── Step 2: Import bookmarks with folder references ──────────────────────────
console.log(`Importing ${bookmarks.length} bookmarks into Sanity...`);
console.log(`Project: ${projectId} | Dataset: ${dataset}\n`);

const BATCH_SIZE = 200;
let imported = 0;
let failed = 0;

for (let i = 0; i < bookmarks.length; i += BATCH_SIZE) {
  const batch = bookmarks.slice(i, i + BATCH_SIZE);
  const transaction = client.transaction();

  for (const bookmark of batch) {
    // Deterministic _id from the URL to avoid duplicates on re-run
    const id = `bookmark-${Buffer.from(bookmark.url).toString("base64url").slice(0, 96)}`;
    const folderId = folderIdMap.get(bookmark.folder);

    transaction.createIfNotExists({
      _id: id,
      _type: "bookmark",
      title: bookmark.title,
      url: bookmark.url,
      folder: {
        _type: "reference",
        _ref: folderId,
      },
    });
  }

  try {
    await transaction.commit();
    imported += batch.length;
    console.log(
      `  Batch ${Math.floor(i / BATCH_SIZE) + 1}: imported ${batch.length} bookmarks (${imported}/${bookmarks.length})`
    );
  } catch (err) {
    failed += batch.length;
    console.error(
      `  Batch ${Math.floor(i / BATCH_SIZE) + 1} FAILED:`,
      err.message
    );
  }
}

console.log(`\nDone! Folders: ${uniqueFolders.length} | Bookmarks imported: ${imported} | Failed: ${failed}`);
