# B2b lane: sanity + studio

Read `docs/review/2026-10-22/briefs/b2-_common.md` first. Report: **`content-agent.md`** (Proposal: `packages/sanity`, `apps/studio`; findings 11, 14, 16, 17).

- Worktree: `/Users/badger3g/Code/badger3000-wt/b2b-sanity`, branch `feat/b2b-sanity`
- Dev port: **4342**
- Signal: `b2b-sanity`

## Your files

`packages/sanity/**`, new `apps/studio/**`, `apps/legacy-next/schemas/**` (moves out), `apps/legacy-next/sanity.config.ts`, `sanity.cli.ts`, `app/studio/**` and `package.json` (only what the schema move needs), `apps/web/src/lib/sanity/**`, `apps/web/src/lib/agent/**`, `apps/web/src/pages/api/**`, `apps/web/scripts/**`, `apps/web/package.json` dependencies, `turbo.json` (new `schema:extract`/`typegen` tasks only), `pnpm-workspace.yaml` (`allowBuilds` only, if Studio deps need it).
**Not:** `src/components/**`, `src/layouts/**`, `src/pages/*.astro`, `src/styles/**`, `src/lib/{chat,browse,shell,island,palette,theme}.ts` (ui lane).

## Tasks, in order

1. **Schema into the package.** `apps/legacy-next/schemas/**` → `packages/sanity/src/schema/` (`git mv`, JS/JSX as-is), exported as `@badger3000/sanity/schema`. `bookmarkStructure.ts` moves to `apps/studio/structure/` (step 4); until then legacy-next keeps importing it. `apps/legacy-next` imports the schema from the package; its embedded `/studio` keeps working (`build` green).
2. **Topics colour fix** (finding 14): the data stores a colour object; make the schema match (`@sanity/color-input`), and fix the consumers' types. Don't change content.
3. **Queries + factory.** `createSanity(config)` per the proposal (no env reading, no module state; `useCdn` default true; `perspective` published unless drafts), `imageUrl`, `API_VERSION`, non-secret `projectId`/`dataset` constants for Studio. One file per content type under `src/queries/` with `defineQuery` (real `groq`, delete the hand-rolled tag), **including every inline projection hoisted out of `apps/web/src/lib/agent/retrieve.ts`** (finding 16) with identical results. `apps/web/src/lib/sanity/` becomes a thin wiring layer (lazy per-isolate instance from `astro:env`, `SANITY_ALLOW_EMPTY` behaviour kept) and **keeps its public API** (see common brief). `scripts/sanity-check.ts` uses the package's `queries` record; `--parse` still works with no network.
4. **`apps/studio`** (`@badger3000/studio`): `sanity.config.ts` + `sanity.cli.ts` from legacy-next, `basePath` dropped, constants from the package instead of env, `studioHost: "badger3000"`, `deployment.autoUpdates`. Scripts: `dev`, `build` (`sanity build`), `schema:extract`. **Never run `sanity deploy`.** `sanity build` must pass locally.
5. **Typegen** (findings 17, 11): `sanity schema extract --enforce-required-fields` → `packages/sanity/schema.json`, `sanity typegen generate` → `src/sanity.types.ts`, both committed. Turbo tasks `schema:extract` → `typegen`, outside the default `build` chain, so CI doesn't need Studio deps. `apps/web/src/lib/sanity/types.ts` re-exports/aliases the generated result types under its existing names; fix whatever nullability breaks in your own files, and list any component/page that breaks under "Handoff" rather than editing it. If keeping the old names compiling would need edits in ui-lane files, keep the hand-written types for those names this step and say so.
6. **Bookmark scripts:** `packages/sanity/scripts/*.mjs` default the dataset to `"production"`; the real dataset is private `badger3000`. Remove the default: a missing env var fails with a clear message (no value printed).

Out of scope: intent scoring, `$q` retrieval, counts, grounding rewrite (B3c); detail-page queries (B3a adds them); content model changes (owner questions 7, 15, 16).

## Lane-specific checks

- `pnpm --filter @badger3000/web run sanity:check` (live counts) and `-- --parse`: every hoisted query parses and returns the same counts as before your change (record before/after).
- `/api/chat` on your dev server: one question per intent (projects, articles, codepen, skills, experience, bookmarks, golf, testimonials) returns 200 with the same cards as before (record before/after card titles).
- `pnpm --filter @badger3000/studio run build` passes; `schema:extract` + `typegen` are reproducible (re-running gives no diff).
- `pnpm --filter @badger3000/web run build` then the token check (`build:verify`) stays clean.
