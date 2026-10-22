---
slug: runbook/badger3000-deploy-astro-to-cloudflare
title: badger3000 — deploy the Astro app to Cloudflare Workers
status: active
date: 2026-10-22
---

# Deploy the Astro app to Cloudflare Workers

How to ship [`apps/web`](../../apps/web) (the Astro front end, ADR 0006) as a Cloudflare Worker. The Next.js app at the repo root still serves the live site — this is the deploy path for the new stack, not a cutover.

## When to use

Any change under `apps/web`. Until the cutover (PRD phase 7) this deploys alongside the Netlify/Next site; it does not touch production traffic.

## Prerequisites

- **Node 24** (`nvm use` picks it up from `.nvmrc`; Astro 7 needs >= 22.23.4).
- `npx wrangler login` once per machine — `npx wrangler whoami` must print an account.
- `npm install` in `apps/web`. If npm reports packages "not yet covered by allowScripts", run `npm install-scripts approve esbuild fsevents workerd` once; the resulting `allowScripts` block in `apps/web/package.json` is what keeps CI installs non-interactive.

## Steps

1. `cd apps/web && npm install`
2. `npm run check` (`astro check` — TypeScript across `.astro` files) and `npm run build`.
3. Preview locally: `npm run preview` → <http://localhost:4321>.
4. `npm run deploy` — `astro build` then `wrangler deploy`.
5. No-auth smoke test (ephemeral account, expires, gives a claimable URL): `npx wrangler deploy --temporary`.

## What gets deployed

`wrangler.jsonc` defines an **assets-only Worker**: `dist/` is uploaded as Workers Static Assets, `html_handling: "auto-trailing-slash"` (matches Astro's `build.format: "directory"`), and `not_found_handling: "404-page"` serves `dist/404.html`.

`public/_headers` is honoured by Cloudflare and is the edge-cache layer: `/_astro/*` is fingerprinted so it ships `max-age=31536000, immutable`; the security headers land on every response.

To switch on server rendering for `/api/chat` (PRD phase 4), install `@astrojs/cloudflare` and let the adapter own `main` + `assets` — the exact steps are in the comment at the top of [`apps/web/astro.config.mjs`](../../apps/web/astro.config.mjs). Prerendered pages keep shipping as assets.

## Verify

```bash
curl -sI https://<worker>.workers.dev/            # 200, cf-cache-status
curl -sI https://<worker>.workers.dev/_astro/*.css # cache-control: …immutable
curl -s  https://<worker>.workers.dev/nope        # 404, our 404 page
```

Then open the URL and click through the three skins (light / dark / forest) and the mobile width.

## Troubleshooting

- **`You are not authenticated`** — `npx wrangler login`.
- **npm skips esbuild/workerd/sharp install scripts** — see prerequisites.
- **404 on a route with no trailing slash** — that is `html_handling`; confirm the page is `dist/<route>/index.html`.
- **Fonts look wrong on first load** — the Google Fonts link is render-blocking by design; if that hurts CWV, self-host with `@fontsource` when phase 3 lands.

## Links

documents:: [[repo/badger3000]]
uses:: [[tech/astro]] [[service/cloudflare]]
relates_to:: [[adr/badger3000-migrate-to-astro]] [[runbook/badger3000-designing-from-the-pen]]