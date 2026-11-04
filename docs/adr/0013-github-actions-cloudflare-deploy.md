---
slug: adr/badger3000-github-actions-cloudflare-deploy
title: badger3000 — deploy apps/web from GitHub Actions, not Workers Builds
status: accepted
date: 2026-10-27
---

# Deploy apps/web from GitHub Actions, not Workers Builds

## Context

The runbook planned Cloudflare Workers Builds (Git integration, no API token in GitHub) for the CI deploy, and an earlier decision rejected a GitHub Action holding `CLOUDFLARE_API_TOKEN`. The owner then asked for the deploy to live in the git workflow, next to `ci.yml`.

## Decision

`.github/workflows/deploy-web.yml` deploys `apps/web` to the Worker `badger3000-web`:

- Push to `astro-dev` (paths under `apps/web`, `packages`, the lockfile) runs `check`, `build` and `wrangler deploy` (`pnpm run deploy:worker`).
- A same-repo pull request runs `check` and `build`, then `wrangler versions upload`; the preview URL goes in the job summary and is not promoted.
- `repository_dispatch` type `sanity-publish` (a Sanity webhook) or a manual run rebuilds with fresh content.
- It calls package scripts, never `turbo run`, because Turbo's cache doesn't know about Sanity content. Builds use real Sanity content and never `SANITY_ALLOW_EMPTY`.
- Runtime secrets live on the Worker (`wrangler secret put`); GitHub holds `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `SANITY_API_TOKEN` and the `PUBLIC_*` variables.

## Options rejected

- **Workers Builds**: kept the token out of GitHub, but the deploy would sit outside the repo's workflows. Do not connect both, or every push deploys twice.

## Consequences

- A Cloudflare API token (Edit Cloudflare Workers) now exists in GitHub secrets; rotate it if leaked.
- The Worker must exist before `versions upload` works, so the first deploy is run locally.
- The trigger is `astro-dev` only; move it to `master` at the cutover (PRD phase 7).

## Links

affects:: [[repo/badger3000]] [[adr/badger3000-studio-and-web-hosting]]
uses:: [[service/cloudflare]] [[service/sanity]]
implements:: [[adr/badger3000-static-first-cloudflare-worker]]
