# packages/sanity/scripts

One-off bookmark data operations against the Sanity dataset (ADR 0004). Run from `packages/sanity` with the app env: `node --env-file=../../apps/web/.env scripts/<name>.mjs`. Project id, dataset and token are all required; there is no default dataset.

- `parse-bookmarks.mjs` — browser bookmarks HTML export → `data/bookmarks.json`
- `import-bookmarks.mjs` — `data/bookmarks.json` → `bookmark` + `bookmarkFolder` documents (needs a write token; safe to re-run)
- `migrate-bookmark-folders.mjs` — string `folder` fields → `bookmarkFolder` references (safe to re-run)
- `migrate-golf-courses.mjs` — `golfScores.course` strings → `golfCourse` documents + references (PRD `golf-handicap-and-courses`, phase 2). Dry run by default; `--apply` writes (needs a write token; safe to re-run)
