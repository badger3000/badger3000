---
slug: adr/badger3000-bookmarks
title: badger3000 — bookmarks in Sanity, saved by a browser extension
status: accepted
date: 2026-03-18
---

# Bookmarks in Sanity, saved by a browser extension

## Context

The `/bookmarks` page needs a low-effort way to add links while browsing.

## Decision

- Bookmarks and folders are Sanity documents (`schemas/parts/bookmark.js`, `bookmarkFolder.js`). `/bookmarks` reads them through `getBookmarks()` and offers search, sorting and folder filters (PR #201).
- `scripts/import-bookmarks.mjs` and `parse-bookmarks.mjs` imported the earlier `data/bookmarks.json`.
- `extensions/bookmark-saver` ("Badger Bookmarks", Chrome Manifest V3) saves the current tab straight to Sanity's API:
  - the project ID and dataset are kept in synced storage;
  - the API token is kept in local storage and needs Editor permission.
- A `declarativeNetRequest` rule (`rules.json`) removes the `Origin` header on requests to `*.api.sanity.io`, so Sanity's CORS check doesn't block the extension.

## Options rejected

- **A JSON file in the repo** (`data/bookmarks.json`): the earlier source, replaced by Sanity. The reason is not recorded.

## Consequences

- Anyone with access to the browser profile can read the Editor token, which can write to the whole dataset. A token scoped to a dedicated role would limit that.
- Removing the `Origin` header means the token, not CORS, is the only protection. Never ship the extension with a token built in.
- The extension is loaded unpacked; see [runbook](../runbooks/install-bookmark-extension.md).

## Links

affects:: [[repo/badger3000]]
uses:: [[service/sanity]]
implements:: [[prd/badger3000-personal-site]]
