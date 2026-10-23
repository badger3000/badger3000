# B3 build — rules for all three lanes

You are one of three build agents working in parallel on step B3 (detail pages, platform endpoints, agent quality). The coordinator merges the branches into `astro-dev` one at a time and resolves the shared-file conflicts listed below. Expect those conflicts; don't work around them.

**Everything in `b2-_common.md` applies** (worktree setup, env symlinks, no pen edits, never print secrets, no push/deploy/`sanity deploy`/`wrangler secret`, commit style and trailer, Done-means checks, final-message sections, signal). Read it first. This file only adds what is new for B3.

Read also: `CLAUDE.md` (updated for the B2 packages), `docs/review/2026-10-22/README.md` (backlog rows B3a/B3b/B3c), and the report named in your brief.

## Owner decisions for B3 (2026-10-23)

- **Article code blocks:** render them. `blockContent` already has a `code` type (`language`, `code`, `filename`), so there is no schema change.
- **Detail heroes** use `main_image` (with its caption), falling back to `gradientFor(_id)` when there is no image. **Cards stay gradients.**
- **Article tags row:** the single `topic` only. No `tags[]` field.
- **"View on CodePen"** uses the existing `primary` Button. No ink variant.
- Still open, so keep current behaviour: suggestion chips fill the composer and don't submit (Q10); golf keeps 3 stats (Q8); no new content fields (Q7, Q15, Q16); `cardLayout` and image `alt` stay as they are.

## Shared files (the coordinator resolves these at merge)

- `apps/web/package.json`, `pnpm-lock.yaml`: add only what your brief allows.
- `packages/sanity/src/sanity.types.ts` (and `schema.json`): run `pnpm turbo run typegen --filter=@badger3000/sanity` after any query change and commit the result. The coordinator regenerates it after merging.
- `packages/sanity/src/queries/index.ts`: append your exports; don't reorder existing lines.
- **SEO contract.** B3b owns `<head>`: `layouts/Base.astro`, the new `Seo.astro`, and `AppShell`'s props. B3b adds an optional `seo` prop to `AppShell` (passed through to `Base`), typed by `SeoProps` from `apps/web/src/lib/seo.ts`:
  ```ts
  export interface SeoProps {
    title?: string; description?: string;
    image?: string;              // absolute URL, or a path under the site
    type?: "website" | "article";
    publishedTime?: string;      // ISO date, articles only
    noindex?: boolean;
  }
  ```
  B3a doesn't wait for it. B3a lists each detail page's intended `seo` values under "Handoff", and the coordinator wires them in after both merges.

## Ports and signals

| lane | worktree / branch | dev port | signal |
|---|---|---|---|
| B3a detail | `badger3000-wt/b3a-detail`, `feat/b3a-detail` | 4351 | `b3a-detail` |
| B3b platform | `badger3000-wt/b3b-platform`, `feat/b3b-platform` | 4352 | `b3b-platform` |
| B3c agent | `badger3000-wt/b3c-agent`, `feat/b3c-agent` | 4353 | `b3c-agent` |

`astro dev` auto-backgrounds and can ignore `--port` when run through pnpm. Use `pnpm exec astro dev --port <yours> --background` from `apps/web`, then check `.astro/dev.json` shows your port. Only stop a server whose `.astro/dev.json` lives in your own worktree.
