---
slug: adr/badger3000-sanity-content
title: badger3000 — all content in Sanity with an embedded Studio
status: accepted
date: 2025-03-11
---

# All content in Sanity with an embedded Studio

## Context

The site's articles, experiments, work history and links change far more often than its code, and should be edited without a deploy.

## Decision

- All content lives in Sanity:
  - articles and categories;
  - CodePen showcases;
  - experience, education, skill categories and testimonials (moved to Sanity in July 2025, PRs #158–#160);
  - bookmarks and folders (moved in March 2026, [ADR 0004](0004-bookmarks-in-sanity-with-extension.md));
  - pages, settings and social links.
- Schemas are in `schemas/`. The client and queries are in `lib/sanity.ts` (`getPosts`, `getBookmarks`) and in the pages that fetch directly.
- Sanity Studio is embedded in the app at `/studio` (`app/studio/[[...index]]`, `sanity.config.ts`), added 2025-03-11. `sanity.cli.ts` also allows deploying it to Sanity's hosting.
- Pages refresh through ISR rather than webhooks ([ADR 0001](0001-nextjs-app-router.md)).

## Options rejected

None recorded.

## Consequences

- A content edit shows up within the page's revalidate window (60 seconds to 1 hour), not instantly.
- Builds, the sitemap script and the README workflow all need `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`.
- PR #214 upgrades to Sanity 6 and next-sanity 13.

## Links

affects:: [[repo/badger3000]]
uses:: [[service/sanity]]
implements:: [[prd/badger3000-personal-site]]
