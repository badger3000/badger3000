# packages/sanity/scripts

One-off bookmark data operations against the Sanity dataset (ADR 0004). Run from `packages/sanity` with the app env: `node --env-file=../../apps/web/.env scripts/<name>.mjs`.

- `parse-bookmarks.mjs` — browser bookmarks HTML export → `data/bookmarks.json`
- `import-bookmarks.mjs` — `data/bookmarks.json` → `bookmark` + `bookmarkFolder` documents (needs a write token; safe to re-run)
- `migrate-bookmark-folders.mjs` — string `folder` fields → `bookmarkFolder` references (safe to re-run)
