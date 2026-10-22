---
slug: adr/badger3000-nextjs-app-router
title: badger3000 — Next.js App Router on Netlify
status: accepted
date: 2024-12-30
---

# Next.js App Router on Netlify

## Context

The site started in 2019 from Sanity's Gatsby blog template and later ran on Astro (upgraded as late as 2024-08). On 2024-12-30 it was rebuilt on Next.js (commit `cc8d53e`, merged in PR #83).

## Decision

- Next.js App Router with React and TypeScript; Tailwind CSS 3 for styling, with Framer Motion for animation. Current versions are in `package.json`.
- Content pages are statically generated and refreshed with ISR: article and CodePen detail pages use `generateStaticParams` and revalidate hourly, `/articles` every 60 seconds, `/bookmarks` hourly.
- Hosted on Netlify (`netlify.toml`): `npm run build`, with API routes running as Netlify Functions.
- `next.config.mjs` serves images from `cdn.sanity.io` as WebP, and strips `console.*` from production builds.

## Options rejected

- **Gatsby** and **Astro**: the earlier stacks. Why they were replaced is not recorded.

## Consequences

- Next.js 16 has breaking changes from older versions; `AGENTS.md` (written by `next dev`) points to the bundled docs in `node_modules/next/dist/docs/`.
- Stripping all console output hides production errors; PR #215 keeps `console.error` and `console.warn` ([incident](../incidents/2026-10-11-contact-form-failing.md)).

## Links

affects:: [[repo/badger3000]]
uses:: [[tech/nextjs]] [[tech/react]] [[tech/typescript]] [[tech/tailwind-css]] [[tech/framer-motion]]
uses:: [[service/netlify]]
