---
slug: runbook/badger3000-local-dev-and-deploy
title: badger3000 — run locally and deploy
status: active
date: 2026-10-22
---

# Run locally and deploy

> This runbook covers the **current** site: Next.js in `apps/legacy-next`, deployed by Netlify. The new Astro app in `apps/web` deploys to Cloudflare Workers — see [deploy-astro-to-cloudflare](./deploy-astro-to-cloudflare.md). The two run side by side until the cutover (PRD phase 7).

## When to use

Setting up the site on a new machine, or shipping a change.

## Prerequisites

- Node 24 (`nvm use`) and pnpm 11 (`corepack enable`). One `pnpm-lock.yaml` at the repo root covers both apps.
- `apps/legacy-next/.env.local` (see [`apps/legacy-next/.env.example`](../../apps/legacy-next/.env.example) for the full list and comments). It takes the same names as `apps/web/.env`, so `ln -s ../web/.env apps/legacy-next/.env.local` works:
  - `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, and `SANITY_API_TOKEN` where a script writes or reads drafts;
  - `PUBLIC_SITE_URL`;
  - `OWNER_EMAIL`, `SMTP_USER`, `SMTP_TOKEN`, `RECAPTCHA_SECRET_KEY`, `PUBLIC_RECAPTCHA_SITE_KEY` for the contact form.
- The same variables in Netlify's site settings.

The `NEXT_PUBLIC_*` spellings still work (each site reads `PUBLIC_X ?? NEXT_PUBLIC_X`) while Next serves production — see [ADR 0010](../adr/0010-public-env-prefix.md). `grep -r NEXT_PUBLIC_` should go quiet at the cutover.

## Steps

1. `pnpm install` at the repo root.
2. `pnpm --filter @badger3000/legacy-next dev` (Turbopack) and open `http://localhost:3000`. Studio is at `/studio`.
3. Before pushing: `pnpm --filter @badger3000/legacy-next run lint`, `typecheck` and `build`. `prebuild` runs `apps/legacy-next/scripts/generate-sitemap.cjs`, which rewrites `public/sitemap.xml`, `public/sitemap-0.xml` and `public/server-sitemap.xml` under `apps/legacy-next`.
4. Push a branch and open a PR. CI (`.github/workflows/ci.yml`) lints and typechecks legacy-next; it doesn't build it (that needs Sanity credentials). Netlify builds the site from the root `netlify.toml` (`base = "apps/legacy-next"`, `pnpm run build`, `@netlify/plugin-nextjs`). Which branches get deploy previews and which deploys production is set in the Netlify dashboard, not in the repo. **Netlify builds are stopped until the cutover** (owner decision, 2026-10-22): the live site stays frozen.

## Verify

- `pnpm --filter @badger3000/legacy-next run test:sitemap` and `test:sitemap:status` check the sitemaps.
- `curl -fsS "$URL/api/articles-feed" | xmllint --noout -` checks the RSS feed (the weekly README workflow depends on it).
- On the deploy preview, open `/`, an article, `/bookmarks` and `/studio`, and submit the contact form once.

## Troubleshooting

- **`git status` shows changed sitemap files after a build**: expected; the prebuild script regenerates them. Commit them only when routes changed.
- **Sanity content missing locally**: check the project ID and dataset; `pnpm --filter @badger3000/web run sanity:check` tests the connection and the queries.
- **Contact form errors**: see the [incident](../incidents/2026-10-11-contact-form-failing.md).

## Links

documents:: [[repo/badger3000]]
uses:: [[service/netlify]] [[service/sanity]]
