# Review — rules for every lane

You are one of four reviewers running in parallel in cmux panes. The coordinator (another Claude session) reads your report and merges it with the others.

## The project

badger3000 is half-way from a Next.js 16 app (repo root, live on Netlify) to Astro 7 + Sanity (`apps/web`, Cloudflare Worker). Read `CLAUDE.md` first, then the ADRs in `docs/adr/0006`–`0010` and `docs/prd/astro-conversion.md`.

Agreed target (decided, don't re-argue it):
- **pnpm + Turborepo** monorepo: `apps/web` (Astro), `apps/studio` (standalone Sanity Studio), `apps/legacy-next` (the current Next app moved there, still deployed on Netlify until cutover), `packages/{tokens,ui,sanity,config}`.
- The design `design/badger3000v2.pen` is the source of truth for UI. Read it **only** through the pencil MCP tools (`get_app_state`, then `execute` with `Get(...)`/`Print(...)` — read-only, never mutate the canvas). Never Read/grep `.pen` files.

## Rules

- **Read-only.** Don't edit any file except your own report. No commits, no installs, no deploys, no `git checkout`. You may run read-only commands and builds into `/tmp`-style throwaway dirs only if needed; prefer reading.
- The dev server is already running at `http://localhost:4322` (cmux workspace "Badger3000"). Don't start or kill servers. For the browser, use `cmux browser open http://localhost:4322/...` in your own pane's workspace, or `curl`.
- Don't print secrets (e.g. `SANITY_API_TOKEN`) — refer to them by name.
- Stay in your lane; if you spot something in another lane, add one line under "Cross-lane notes".

## Seed findings (already known — verify, deepen, don't just repeat)

1. `SANITY_API_TOKEN` inlined into the Worker bundle (`apps/web/src/lib/sanity/client.ts:19-26`, `import.meta.env`).
2. Chat double-submit: `lib/chat.ts:278-279` runs `init()` and also on `astro:page-load` (fires on first load too). Same pattern in `browse.ts:50`, `ThemeToggle.astro:114`, `pages/projects.astro:270`.
3. `MobileDrawer.astro:332,353` caches DOM nodes once; dies after a client-side navigation.
4. `/api/chat` 500s when Sanity fails (`pages/api/chat.ts:70` outside try; null-unsafe rows in `lib/agent/retrieve.ts`).
5. No `articles/[slug]` / `codepen/[slug]` routes, yet links point there.
6. Parity gaps vs Next: contact endpoint, RSS (`/api/articles-feed` used by `scripts/update-readme.js`), sitemap, Studio, OG/manifest/icons, print résumé, redirects, apex vs www (`astro.config.mjs site` is apex, all else `www`).

## Report format

Write `docs/review/2026-10-22/<lane>.md`:

```
# <lane> review
## Summary (5 lines max)
## Findings
| # | sev | where (file:line or pen id) | problem | fix | effort |
   sev = P0 (broken/security) · P1 (wrong/user-visible) · P2 (debt/quality) · P3 (nit)
   effort = S (<1h) · M (half day) · L (more)
## Proposal   (lane-specific: target structure / API / backlog items for Phase B)
## Cross-lane notes
## Open questions for the owner
```

Every finding needs a concrete location and a concrete fix. No generic advice.

## When done

Run exactly: `cmux wait-for -S review-<lane>` (that signals the coordinator), then print `DONE <lane>` and stop.
