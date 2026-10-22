---
slug: runbook/badger3000-local-dev-and-deploy
title: badger3000 — run locally and deploy
status: active
date: 2026-10-22
---

# Run locally and deploy

> This runbook covers the **current** site: Next.js at the repo root, deployed by Netlify. The new Astro app in `apps/web` deploys to Cloudflare Workers — see [deploy-astro-to-cloudflare](./deploy-astro-to-cloudflare.md). The two run side by side until the cutover (PRD phase 7).

## When to use

Setting up the site on a new machine, or shipping a change.

## Prerequisites

- Node.js and npm (`package-lock.json`).
- `.env.local` with:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and `SANITY_API_TOKEN` where a script writes or reads drafts;
  - `SITE_URL`;
  - `RESEND_API_KEY`, `OWNER_EMAIL`, `CONTACT_FORM_EMAIL`, `RECAPTCHA_SECRET_KEY`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` for the contact form.
- The same variables in Netlify's site settings.

## Steps

1. `npm install`
2. `npm run dev` (Turbopack) and open `http://localhost:3000`. Studio is at `/studio`.
3. Before pushing: `npm run lint` and `npm run build`. `prebuild` runs `scripts/generate-sitemap.cjs`, which rewrites `public/sitemap.xml`, `public/sitemap-0.xml` and `public/server-sitemap.xml`.
4. Push a branch and open a PR against `master`. Netlify builds the site with `@netlify/plugin-nextjs` (`netlify.toml`). Which branches get deploy previews and which deploys production is set in the Netlify dashboard, not in the repo.

## Verify

- `npm run test:sitemap` and `npm run test:sitemap:status` check the sitemaps.
- `node scripts/test-feed.js` checks the RSS feed.
- On the deploy preview, open `/`, an article, `/bookmarks` and `/studio`, and submit the contact form once.

## Troubleshooting

- **`git status` shows changed sitemap files after a build**: expected; the prebuild script regenerates them. Commit them only when routes changed.
- **Sanity content missing locally**: check the project ID and dataset; `node scripts/verify-sanity.js` tests the connection.
- **Contact form errors**: see the [incident](../incidents/2026-10-11-contact-form-failing.md).

## Links

documents:: [[repo/badger3000]]
uses:: [[service/netlify]] [[service/sanity]]
