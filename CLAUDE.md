# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Two apps, one workspace (mid-migration)

The site is being moved from Next.js to Astro (ADR 0006, PRD `docs/prd/astro-conversion.md`). The repo is a pnpm + Turborepo workspace (ADR 0007, `docs/runbooks/turborepo-migration.md`); both stacks live side by side until the cutover (PRD phase 7):

- **`apps/legacy-next` — `@badger3000/legacy-next`, Next.js 16 (legacy, serves production).** App Router in `app/`, React components in `components/`, embedded Sanity Studio at `/studio`, deployed by Netlify from the root `netlify.toml` (`base = "apps/legacy-next"`). Netlify builds are stopped until the cutover, so the live site is frozen. See `apps/legacy-next/AGENTS.md`: this Next version has breaking changes; read `apps/legacy-next/node_modules/next/dist/docs/` before editing Next code. Deleted at cutover.
- **`apps/web` — `@badger3000/web`, Astro 7 (the new front end, active work on `astro-dev`).** Deployed to Cloudflare Workers (Workers Builds, not yet connected).
- **`packages/config`** (`tsconfig.base.json`, `eslint/astro.js`, not wired into `apps/web` yet) and **`packages/sanity`** (today only the bookmark data scripts and `data/`). `packages/tokens`, `packages/ui` and `apps/studio` are planned (B2): until they exist, runbooks that mention them mean `apps/web/src/*` and `apps/legacy-next/schemas`.

One `pnpm-lock.yaml` at the root. Root `README.md` is the GitHub profile README (ADR 0005), not project docs. `.github/workflows/blog-post-workflow.yml` rewrites the `BLOG-POST-LIST` block weekly via `scripts/update-readme.js` (the only root script) — don't hand-edit that block.

## Commands

Run from the repo root after `nvm use` (Node 24, `.nvmrc`) and `pnpm install`. `pnpm --filter <pkg> run <script>` runs one package's script; inside an app dir, plain `pnpm run <script>` does the same.

### Workspace (Turbo)

```bash
pnpm turbo run check lint typecheck build                   # everything, cached
SANITY_ALLOW_EMPTY=1 pnpm turbo run check lint typecheck build --filter='!@badger3000/legacy-next'   # what CI runs
pnpm turbo run lint typecheck --filter=@badger3000/legacy-next                                      # CI's legacy job
```

Turbo is for local runs and CI only. Deploy hosts call package scripts directly: Turbo's cache doesn't know about Sanity content, and its strict env mode drops undeclared vars (declare new build env in `turbo.json`). Build scripts need approval: `pnpm approve-builds <pkg>` writes `allowBuilds` in `pnpm-workspace.yaml`.

### `@badger3000/web` (Astro)

```bash
pnpm --filter @badger3000/web run dev                       # astro dev, localhost:4321
pnpm --filter @badger3000/web run check                     # astro check (TS over .astro files) — the typecheck
pnpm --filter @badger3000/web run build                     # static build into dist/, then verify-dist
pnpm --filter @badger3000/web run sanity:check              # parse every GROQ projection, then fetch counts
pnpm --filter @badger3000/web run sanity:check -- --parse   # syntax only, no network
pnpm --filter @badger3000/web run preview                   # serve dist/
pnpm --filter @badger3000/web run deploy:dry                # build + wrangler deploy --dry-run
pnpm --filter @badger3000/web run deploy                    # build + wrangler deploy
pnpm --filter @badger3000/web run cf:dev                    # wrangler dev (Worker incl. /api/chat)
```

Every script runs through `scripts/node-guard.mjs`, which finds a Node satisfying `engines.node` (>=22.23.4; `.nvmrc` is 24) and re-execs with it. Bare `pnpm exec astro …`/`pnpm exec wrangler …` bypass the guard — run `nvm use` first. Env comes from `apps/web/.env` (copy `.env.example`); Astro only loads env from its own directory. `SANITY_ALLOW_EMPTY=1` builds with no credentials (every query returns empty); deploy builds must never set it.

### `@badger3000/legacy-next` (Next.js)

```bash
pnpm --filter @badger3000/legacy-next run dev          # next dev --turbopack, localhost:3000 (Studio at /studio)
pnpm --filter @badger3000/legacy-next run lint         # eslint .
pnpm --filter @badger3000/legacy-next run typecheck    # tsc --noEmit
pnpm --filter @badger3000/legacy-next run build        # prebuild regenerates apps/legacy-next/public/sitemap*.xml — commit those only when routes changed
pnpm --filter @badger3000/legacy-next run test:sitemap && pnpm --filter @badger3000/legacy-next run test:sitemap:status
curl -fsS "$URL/api/articles-feed" | xmllint --noout -  # RSS check (the README workflow reads this feed)
```

Env comes from `apps/legacy-next/.env.local`, with the same `PUBLIC_*` names as `apps/web/.env`; a symlink (`ln -s ../web/.env apps/legacy-next/.env.local`) is fine. The Next build needs Sanity credentials, so CI only lints and typechecks it.

There is no unit test suite; verification is `check`/`lint`/`typecheck`/`build`/`sanity:check` plus the sitemap scripts.

## `apps/web` architecture

- **Static-first on a Worker (ADR 0009).** `output` stays static with `@astrojs/cloudflare`; every page is prerendered and only routes with `export const prerender = false` (today just `src/pages/api/chat.ts`) run on the Worker. The adapter owns `main`/`assets` in `wrangler.jsonc`. `public/_headers` is the cache/security policy for assets (not for Worker responses). The adapter writes the local token to `dist/server/.dev.vars`; `verify-dist` checks it isn't deployed and `turbo.json` keeps it out of the cache.
- **Content layer:** `src/lib/sanity/` is the only code that knows about Sanity — `client.ts` (env via `astro:env`), `queries.ts` (one GROQ projection per browse view, aliased so the pen's `← field` bindings match, refs dereferenced in GROQ), `types.ts` (mirrors `apps/legacy-next/schemas/parts/*.js`). **When the pen and the schema disagree, the schema wins.** The dataset is private, so reads use `SANITY_API_TOKEN`; `PUBLIC_SANITY_USE_CDN` defaults to **true** (the CDN works with the token). Drafts are opt-in: `SANITY_PREVIEW=drafts`; otherwise the published perspective.
- **Agent chat (ADR 0008):** `POST /api/chat` = `lib/agent/intents.ts` (keyword/regex classify) → `lib/agent/retrieve.ts` (GROQ per intent → cards) → `lib/agent/compose.ts` (optional Workers AI via the `AI` binding) → `{ intent, text, cards, suggestions?, composed }`. Deterministic template phrasing is the real answer path; the model tier is off by default (`CHAT_MODEL_TIER`) and any model output must pass the grounding check. No vendor LLM keys.
- **Chat client:** `src/lib/chat.ts` is a vanilla island. Bubble/message/card markup is defined once in Astro components and cloned from `<template data-chat-*>` elements — change markup in the `.astro` component, not in JS. The thread lives in `sessionStorage`, not the URL.
- **Navigation:** `<ClientRouter />` in `layouts/Base.astro`. Only `AppShell`'s scroll area has `transition:name="content"`; the chrome is re-rendered (never `transition:persist`) so `aria-current` stays correct, and components must (re)initialise on `astro:page-load` (`lib/island.ts`; document-level delegates in `lib/shell.ts`). `.body` is the sole scroll container; scroll positions are saved per URL in `sessionStorage`.
- **Env (ADR 0010):** browser-visible vars use `PUBLIC_` and are declared in `env.schema` in `astro.config.mjs` (all optional so credential-less builds work; the client throws naming the missing key on first use). Secrets are `context: "server"` and read via `astro:env/server`. Never give a secret a `PUBLIC_` prefix. The Next app reads `PUBLIC_X ?? NEXT_PUBLIC_X` until the cutover deletes the fallbacks.

## Design is the source of truth

`design/badger3000v2.pen` (pen.dev) defines geometry, tokens, components and screens. Workflow is in `docs/runbooks/designing-from-the-pen.md`:

- Read the design through the **pencil MCP** (`get_app_state` first, then `execute`); the Pen app must be running with the file open, and the canvas can be ahead of the file on disk. Don't read `.pen` files with Read/Grep.
- Each node's `context` string is the spec: semantic tag + component name + props, or the Sanity binding (`← project.title`).
- Change the `.pen` first, then port to code.
- **Tokens only:** components use `var(--a-*)` from `src/styles/tokens.css`; never hardcode colors. Themes (light/dark/forest) are `[data-theme]` blocks on `<html>`.
- **No React in `apps/web`** — islands are vanilla TS until a component genuinely needs a framework. Components use scoped CSS, no Tailwind (Tailwind is only in the Next app).

## Docs

Decisions, plans and procedures live in `docs/adr`, `docs/prd`, `docs/runbooks`, `docs/incidents` (frontmatter `slug`/`status`/`date` + a `## Links` section with `affects::`/`uses::` lines). Read the relevant ADR before changing hosting, env naming, the chat pipeline or repo layout; add a new ADR when such a decision changes. `docs/review/<date>/` is a dated record: don't edit it.
