---
slug: adr/badger3000-static-first-cloudflare-worker
title: badger3000 — deploy the Astro app as a static Workers asset worker first
status: accepted
date: 2026-10-22
---

# Deploy the Astro app as a static Workers asset worker first

## Context

[ADR 0006](./0006-migrate-to-astro.md) picks the Cloudflare adapter for `/api/chat`, and the plan ([PRD](../prd/astro-conversion.md)) says platform work lands in phase 5, after the agent in phase 4. Phase 1 (the foundation in `apps/web`) ships no on-demand routes at all: the token layer, `Base` layout, the theme toggle, `Button`, and the agent home shell.

The Cloudflare adapter also stopped being a drop-in in recent majors: v13+ dropped Cloudflare Pages support entirely, its dev server runs on `workerd` rather than wrangler, and it now owns the `main` entry and the `assets` block itself. It wants `wrangler >= 4.125`. Adopting it in phase 1 would mean carrying an adapter, a generated worker entry and workerd-based dev server for a build that produces nothing dynamic.

## Decision

**Static-first.** `apps/web` builds with `output: "static"` and no adapter; `wrangler deploy` uploads `dist/` to an **assets-only Worker** (Workers Static Assets).

- `build.format: "directory"` in `astro.config.mjs` is paired with `html_handling: "auto-trailing-slash"` in `wrangler.jsonc`, so `/about` and `/about/` both resolve to `dist/about/index.html`.
- `not_found_handling: "404-page"` serves `dist/404.html` for unknown paths.
- **`public/_headers` is the edge layer**, not a Worker script: `/_astro/*` is content-fingerprinted so it ships `max-age=31536000, immutable`, and the security headers (`nosniff`, `Referrer-Policy`, `X-Frame-Options`) apply to every response. Cloudflare reads `_headers` straight out of the assets.
- When `/api/chat` lands (phase 4), install `@astrojs/cloudflare`, let the adapter own `main` + `assets`, **delete the hand-written `assets` block**, and set `export const prerender = false` only on the endpoint routes. Content pages keep shipping as assets — this is the "static-first, on-demand for `/api/*`" shape the PRD asked for, minus the adapter tax during phases 1–3.

Two supporting pins came out of the same session:

- **Astro 7 / wrangler 4** in `apps/web` (the scaffold had pinned Astro ^5 and wrangler ^3). Astro 7 raises the floor to Node `>=22.23.4`, above this machine's default v22.23.0, so `engines.node` in `apps/web/package.json` matches the repo's Node 24 (`.nvmrc`, CI, `netlify.toml`).
- **`scripts/node-guard.mjs` wraps every npm script.** npm runs scripts under whatever `node` is first on `PATH`, and `engines` is advisory — so the build died with Astro's "not supported" error. The guard parses the floor out of `engines.node`, finds a supported interpreter (nvm dirs by version name, Volta/mise/Homebrew, then `PATH`, preferring `.nvmrc`), and re-runs the command with it. `nvm use` discipline is now only needed for bare commands like `npx astro …`.

## Options rejected

- **Adopt the adapter now** — an adapter, a generated entry and a workerd dev server for a build with zero dynamic routes. The migration is four commented lines in `astro.config.mjs` whenever phase 4 starts.
- **Cloudflare Pages** — removed from the adapter in v13; Workers Static Assets is where Astro on Cloudflare goes.
- **Stay on Netlify for the Astro app** — splits the deploy story across two platforms while both stacks are alive, and loses the Workers AI co-location that [ADR 0008](./0008-agent-chat-grounded-no-vendor-key.md) depends on.

## Consequences

- Deploy is `astro build && wrangler deploy`; the whole site is a 60 KB static bundle with no framework JS.
- `_headers` is load-bearing: it is the only cache/security policy in play, and it silently does nothing if the site ever moves to a Worker script that does not forward the asset headers.
- Domain cutover is still phase 7. The worker lives at `badger3000-web.<account>.workers.dev`; `badger3000.com` stays on Netlify/Next until the cutover.
- One runtime version to reason about is no longer implied by the shell. Anything invoking `astro`/`wrangler` outside the npm scripts must run `nvm use` itself.

## Links

affects:: [[repo/badger3000]]
uses:: [[tech/astro]] [[service/cloudflare]]
implements:: [[prd/badger3000-astro-conversion]]