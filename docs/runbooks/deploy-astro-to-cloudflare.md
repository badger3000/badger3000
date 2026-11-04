---
slug: runbook/badger3000-deploy-astro-to-cloudflare
title: badger3000 — deploy the Astro app to Cloudflare Workers
status: active
date: 2026-10-22
---

# Deploy the Astro app to Cloudflare Workers

How to ship [`apps/web`](../../apps/web) (`@badger3000/web`, the Astro front end, ADR 0006) as a Cloudflare Worker. The Next.js app in `apps/legacy-next` still serves the live site: this is the deploy path for the new stack, not a cutover.

## When to use

Any change under `apps/web`. Until the cutover (PRD phase 7) this deploys alongside the Netlify/Next site; it does not touch production traffic.

## Prerequisites

- **Node 24** (`.nvmrc`; Astro 7 needs >= 22.23.4). You don't have to switch manually: every `apps/web` script goes through `scripts/node-guard.mjs`, which finds a supported interpreter (nvm / Volta / Homebrew / PATH, preferring `.nvmrc`) and re-runs the command with it:

  ```bash
  $ pnpm --filter @badger3000/web run build
  node-guard: v22.23.0 does not satisfy ">=22.23.4" — using v24.22.1 from ~/.nvm/versions/node/v24.22.1/bin/node
  ```

  Outside those scripts (a bare `pnpm exec astro …`, an editor task) still run `nvm use`.
- `pnpm --filter @badger3000/web exec wrangler login` once per machine; `… exec wrangler whoami` must print an account.
- `pnpm install` at the repo root (one `pnpm-lock.yaml` for the workspace). Build scripts for `esbuild`, `workerd` and `unrs-resolver` are approved in `pnpm-workspace.yaml` (`allowBuilds`). If pnpm reports a new ignored build, run `pnpm approve-builds <pkg>` and commit the change.
- `apps/web/.env` (copy `apps/web/.env.example`). `SANITY_ALLOW_EMPTY=1` builds with no credentials (CI does); deploy builds never set it, so a misconfigured deploy fails loudly.

## Steps

Run from the repo root (or `pnpm run <script>` inside `apps/web`):

1. `pnpm install`
2. `pnpm --filter @badger3000/web run check` (`astro check`, TypeScript across `.astro` files) and `pnpm --filter @badger3000/web run build`.
3. Preview locally: `pnpm --filter @badger3000/web run preview` → <http://localhost:4321>, or `cf:dev` for the Worker including `/api/chat`.
4. `pnpm --filter @badger3000/web run deploy`: `astro build`, then `wrangler deploy`. `deploy:dry` stops before uploading.
5. No-auth smoke test (ephemeral account, expires, gives a claimable URL): `pnpm --filter @badger3000/web exec wrangler deploy --temporary`.

**CI deploy: GitHub Actions** (`.github/workflows/deploy-web.yml`, supersedes the Workers Builds plan). It calls the package scripts, never `turbo run`, because Turbo's cache doesn't know about Sanity content.

- Push to `master` (paths under `apps/web`, `packages`, lockfile) → `check`, `build`, `deploy:worker` (production).
- Push to any other branch → `check`, `build`, `wrangler versions upload`; the preview URL is in the job summary. Not promoted. Pushes only run this when they touch those paths.
- `repository_dispatch` type `sanity-publish`, or **Run workflow** on `master` → rebuild production with fresh content. **Run workflow** on another branch uploads a preview of it.

GitHub repo settings: secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `SANITY_API_TOKEN`; variables `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, `PUBLIC_SITE_URL`, `PUBLIC_RECAPTCHA_SITE_KEY` (the reCAPTCHA v3 site key; the `/contact` form says it is not set up without it), and optionally `PUBLIC_GTM_ID` (the `GTM-XXXX` container id; unset means no tag loads, see ADR 0014).

Cloudflare side (one time): create an API token from the "Edit Cloudflare Workers" template (Workers Scripts: Edit, plus Workers AI and Account Settings read), note the account ID, run the first `deploy` locally so the Worker exists, then `wrangler secret put` each runtime secret (`SANITY_API_TOKEN`, `RECAPTCHA_SECRET_KEY`, `OWNER_EMAIL`, `SMTP_USER`, `SMTP_TOKEN`). Do not also connect Workers Builds, or every push deploys twice.

Sanity webhook (optional): POST to `https://api.github.com/repos/badger3000/badger3000/dispatches` with body `{"event_type":"sanity-publish"}` and a fine-grained PAT scoped to this repo with Contents: read and write (the dispatches endpoint requires it).

## What gets deployed

`@astrojs/cloudflare` owns `main` and `assets` in `wrangler.jsonc` (ADR 0009, phase 4 reached). Every page is prerendered into `dist/client` and served as Workers Static Assets; only routes with `export const prerender = false` (today `src/pages/api/chat.ts`) run in the Worker. `wrangler.jsonc` adds the `AI` binding (ADR 0008), the `CHAT_LIMITER` rate limit and observability.

Static prerendering deliberately uses Astro's Node environment (`prerenderEnvironment: "node"` in `astro.config.mjs`). The Workers AI binding has no local simulator, so the adapter's default `workerd` prerender opens an authenticated Cloudflare remote proxy during every build. That would force a Cloudflare token into GitHub CI even though no prerendered page uses a Workers binding. The deployed Worker still runs on `workerd`, and the AI binding remains available to `/api/chat` at runtime.

`public/_headers` is honoured by Cloudflare and is the edge-cache layer for assets: `/_astro/*` is fingerprinted, so it ships `max-age=31536000, immutable`. It doesn't apply to Worker responses (`/api/*`).

The adapter writes `dist/server/.dev.vars` with the local `SANITY_API_TOKEN` for `wrangler dev`. It isn't deployed (`verify-dist` checks), and Turbo excludes it from the cache.

## Verify

```bash
curl -sI https://<worker>.workers.dev/            # 200, cf-cache-status
curl -sI https://<worker>.workers.dev/_astro/*.css # cache-control: …immutable
curl -s  https://<worker>.workers.dev/nope        # 404, our 404 page
curl -s -X POST https://<worker>.workers.dev/api/chat -H 'content-type: application/json' -d '{"message":"projects"}'
```

Then open the URL and click through the three skins (light / dark / forest) and the mobile width.

## Custom domain

Point `badger3000.com` and `www.badger3000.com` at the Worker (PRD phase 7 cutover step). The zone must already be on Cloudflare DNS.

1. Delete any existing A/AAAA/CNAME records for the apex and `www` (the old Netlify ones). A custom domain can't be added over an existing record.
2. Dashboard → **Workers & Pages** → **badger3000-web** → **Settings** → **Domains & Routes** → **Add** → **Custom domain**. Add the apex, then `www`. Cloudflare creates the proxied DNS record and the certificate; the domain shows **Active** within a few minutes.
   - Doing it in `wrangler.jsonc` instead (`routes` with `"custom_domain": true`) works too, but a deploy then removes any dashboard-only domains. Use one method.
3. Redirect the non-canonical host (`www` → apex, or the reverse) with a **Redirect Rule** (301). Set `PUBLIC_SITE_URL` to the canonical origin.
4. Keep the Netlify site paused, not deleted, until you've verified; rolling back means removing the custom domain and restoring the old record.

Verify it is the Astro build and not the Next one:

```bash
curl -sI https://badger3000.com | grep -iE "^(HTTP|server|cf-ray|content-security-policy)"  # cloudflare, CSP from public/_headers
curl -s  https://badger3000.com | grep -c "/_astro/"                                        # > 0 (Next serves /_next/static)
```

**Propagation.** Domain already on Cloudflare DNS: 1–5 minutes (the certificate is the slow part, rarely up to ~15). Nameserver change at the registrar: minutes to 24 h. Old cached records live until their TTL; lower it to 60 s a day ahead of a cutover.

**"I updated DNS but still see the old site"**: the edge is usually already right and a cache is stale. Check in order:

1. `dig +short badger3000.com @1.1.1.1` returns Cloudflare IPs (104.21.x / 172.67.x for proxied records) and the curl above shows `/_astro/`: the cutover worked.
2. Flush the local resolver: `sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder` (macOS). Chrome also keeps its own: `chrome://net-internals/#dns` → **Clear host cache**, and **Clear browsing data** for cached files.
3. Try a private window, another network or a phone on cellular.
4. Bypass the resolver: `curl --resolve badger3000.com:443:<cloudflare-ip> https://badger3000.com`.
5. If dig still returns Netlify IPs or the Next markup (`/_next/static`), a record is still pointing at Netlify: re-check step 1 above, and make sure the zone's nameservers at the registrar are the ones Cloudflare assigned.
6. HTML is `max-age=0, must-revalidate`, but `cf-cache-status: HIT` after a deploy means purge: **Caching → Configuration → Purge Everything**.

## Troubleshooting

- **`Node.js vX is not supported by Astro`**: you ran `astro` outside the package scripts (so the guard never ran). Use the scripts, or `nvm use` first.
- **`You are not authenticated`**: `wrangler login` (see prerequisites).
- **pnpm "Ignored build scripts"**: `pnpm approve-builds <pkg>`, see prerequisites.
- **404 on a route with no trailing slash**: assets use Cloudflare's default `html_handling` (`auto-trailing-slash`); confirm the page is `dist/client/<route>/index.html`.
- **`Missing Sanity configuration.` at build**: `apps/web/.env` is missing or incomplete (Astro only loads env from its own directory).

## Links

documents:: [[repo/badger3000]]
uses:: [[tech/astro]] [[service/cloudflare]]
implements:: [[adr/badger3000-static-first-cloudflare-worker]]
