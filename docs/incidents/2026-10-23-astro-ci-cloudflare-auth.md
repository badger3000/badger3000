---
slug: incident/badger3000-astro-ci-cloudflare-auth
title: badger3000 — Astro CI required Cloudflare authentication
status: resolved
date: 2026-10-23
---

# Astro CI required Cloudflare authentication

## Summary

The GitHub Actions CI build of `apps/web` failed while prerendering static routes. The Astro Cloudflare adapter's default `workerd` prerender environment tried to open a remote proxy for the Workers AI binding, and the non-interactive runner had no `CLOUDFLARE_API_TOKEN`.

Adding a token to the Cloudflare Workers Builds project did not help this job: the failure was in `.github/workflows/ci.yml`, not in the Workers Builds deployment.

## Impact

Pull-request and branch CI failed at `@badger3000/web#build`, so the normal verification gate was red. No production deployment was attempted by that workflow.

## Cause

`apps/web/wrangler.jsonc` includes the `AI` binding. Cloudflare's local Vite plugin treats Workers AI as a remote-only resource because it has no local simulator. With the adapter's default `prerenderEnvironment: "workerd"`, every build therefore established an authenticated remote proxy even though no prerendered page uses the binding. Only `/api/chat` and `/api/contact` use Workers bindings, and both set `prerender = false`.

## Fix

`apps/web/astro.config.mjs` now uses `prerenderEnvironment: "node"`. Static pages and `/api/articles-feed` are prerendered in Node without contacting Cloudflare; the deployed Worker still runs on `workerd`, and the `AI`, rate-limit, KV, Images and Assets bindings remain in the deployed configuration.

GitHub Actions therefore stays credential-less. The Cloudflare token is needed only by Workers Builds for the actual deployment, matching the Workers Builds decision.

Rejected: adding a Cloudflare API token to GitHub Actions. It would expose deployment credentials to every CI run merely to satisfy a remote proxy that the static pages do not need.

## Verification

On Node 24, with `CI=true`, `SANITY_ALLOW_EMPTY=1`, and no `CLOUDFLARE_API_TOKEN` or related Cloudflare authentication variables:

```bash
pnpm turbo run check lint typecheck build --filter='!@badger3000/legacy-next'
```

All 8 tasks passed, no remote proxy was opened, and `wrangler deploy --dry-run` still listed the `AI`, `CHAT_LIMITER`, `CONTACT_LIMITER`, `SESSION`, `IMAGES` and `ASSETS` bindings.

## Links

affects:: [[repo/badger3000]]
caused:: [[adr/badger3000-chat-model-tier-off]]
uses:: [[tech/astro]] [[service/cloudflare]]
