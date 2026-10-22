# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Two apps, one repo (mid-migration)

The site is being moved from Next.js to Astro (ADR 0006, PRD `docs/prd/astro-conversion.md`). Both stacks live side by side until the cutover (PRD phase 7):

- **Repo root — Next.js 16 (legacy, serves production).** App Router in `app/`, React components in `components/`, embedded Sanity Studio at `/studio`, deployed by Netlify (`netlify.toml`). See `AGENTS.md`: this Next version has breaking changes; read `node_modules/next/dist/docs/` before editing Next code.
- **`apps/web` — Astro 7 (the new front end, active work on `astro-dev`).** Deployed to Cloudflare Workers. Separate `package.json`/lockfile — run its commands from inside `apps/web`.

The Turborepo/pnpm split (`packages/ui`, `packages/tokens`, `packages/sanity`, ADR 0007) is planned but **not done**: runbooks that mention `packages/*` mean `apps/web/src/*` today. The "Not built yet" table in `apps/web/README.md` lags behind; the Cloudflare adapter, browse routes and `/api/chat` already exist.

Root `README.md` is the GitHub profile README (ADR 0005), not project docs. `.github/workflows/blog-post-workflow.yml` rewrites the `BLOG-POST-LIST` block weekly via `scripts/update-readme.js` — don't hand-edit that block.

## Commands

### `apps/web` (Astro)

```bash
cd apps/web
npm run dev                       # astro dev, localhost:4321
npm run check                     # astro check (TS over .astro files) — the typecheck
npm run build                     # static build into dist/
npm run sanity:check              # parse every GROQ projection, then fetch counts
npm run sanity:check -- --parse   # syntax only, no network
npm run preview                   # serve dist/
npm run deploy:dry                # build + wrangler deploy --dry-run
npm run deploy                    # build + wrangler deploy
npm run cf:dev                    # wrangler dev (Worker incl. /api/chat)
```

Every script runs through `scripts/node-guard.mjs`, which finds a Node satisfying `engines.node` (>=22.23.4; `.nvmrc` is 24) and re-execs with it. Bare `npx astro …`/`npx wrangler …` bypass the guard — run `nvm use` first. Env comes from `apps/web/.env` (copy `.env.example`); Astro only loads env from its own directory.

### Repo root (Next.js)

```bash
npm run dev          # next dev --turbopack, localhost:3000 (Studio at /studio)
npm run lint         # eslint .
npm run typecheck    # tsc --noEmit
npm run build        # prebuild regenerates public/sitemap*.xml — commit those only when routes changed
npm run test:sitemap && npm run test:sitemap:status
node scripts/test-feed.js        # RSS check
node scripts/verify-sanity.js    # Sanity connectivity
```

There is no unit test suite; verification is `check`/`build`/`sanity:check` plus the ad-hoc scripts in `scripts/`.

## `apps/web` architecture

- **Static-first on a Worker (ADR 0009).** `output` stays static with `@astrojs/cloudflare`; every page is prerendered and only routes with `export const prerender = false` (today just `src/pages/api/chat.ts`) run on the Worker. The adapter owns `main`/`assets` in `wrangler.jsonc`. `public/_headers` is the cache/security policy for assets.
- **Content layer:** `src/lib/sanity/` is the only code that knows about Sanity — `client.ts` (env + draft-aware client), `queries.ts` (one GROQ projection per browse view, aliased so the pen's `← field` bindings match, refs dereferenced in GROQ), `types.ts` (mirrors `schemas/parts/*.js` at the repo root). **When the pen and the schema disagree, the schema wins.** The dataset is private, so `PUBLIC_SANITY_USE_CDN` defaults to false.
- **Agent chat (ADR 0008):** `POST /api/chat` = `lib/agent/intents.ts` (keyword/regex classify) → `lib/agent/retrieve.ts` (GROQ per intent → cards) → `lib/agent/compose.ts` (optional Workers AI via the `AI` binding) → `{ intent, text, cards, suggestions?, composed }`. Deterministic template phrasing is the real answer path; the model tier is off by default (`CHAT_MODEL_TIER`) and any model output must pass the grounding check. No vendor LLM keys.
- **Chat client:** `src/lib/chat.ts` is a vanilla island. Bubble/message/card markup is defined once in Astro components and cloned from `<template data-chat-*>` elements — change markup in the `.astro` component, not in JS. The thread lives in `sessionStorage`, not the URL.
- **Navigation:** `<ClientRouter />` in `layouts/Base.astro`. Only `AppShell`'s scroll area has `transition:name="content"`; the chrome is re-rendered (never `transition:persist`) so `aria-current` stays correct, and components must (re)initialise on `astro:page-load`. `.body` is the sole scroll container; scroll positions are saved per URL in `sessionStorage`.
- **Env (ADR 0010):** browser-visible vars use `PUBLIC_` and are declared in `env.schema` in `astro.config.mjs` (all optional so credential-less builds work; the client throws naming the missing key on first use). Never give a secret a `PUBLIC_` prefix. The Next app reads `PUBLIC_X ?? NEXT_PUBLIC_X` until the cutover deletes the fallbacks.

## Design is the source of truth

`design/badger3000v2.pen` (pen.dev) defines geometry, tokens, components and screens. Workflow is in `docs/runbooks/designing-from-the-pen.md`:

- Read the design through the **pencil MCP** (`get_app_state` first, then `execute`); the Pen app must be running with the file open, and the canvas can be ahead of the file on disk. Don't read `.pen` files with Read/Grep.
- Each node's `context` string is the spec: semantic tag + component name + props, or the Sanity binding (`← project.title`).
- Change the `.pen` first, then port to code.
- **Tokens only:** components use `var(--a-*)` from `src/styles/tokens.css`; never hardcode colors. Themes (light/dark/forest) are `[data-theme]` blocks on `<html>`.
- **No React in `apps/web`** — islands are vanilla TS until a component genuinely needs a framework. Components use scoped CSS, no Tailwind (Tailwind is only in the Next app).

## Docs

Decisions, plans and procedures live in `docs/adr`, `docs/prd`, `docs/runbooks`, `docs/incidents` (frontmatter `slug`/`status`/`date` + a `## Links` section with `affects::`/`uses::` lines). Read the relevant ADR before changing hosting, env naming, the chat pipeline or repo layout; add a new ADR when such a decision changes.
