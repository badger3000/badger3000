---
slug: adr/badger3000-github-profile
title: badger3000 — the repo doubles as the GitHub profile
status: accepted
date: 2026-10-22
---

# The repo doubles as the GitHub profile

## Context

GitHub shows the `README.md` of the repository named after the user as their profile page. This repo is `badger3000/badger3000`.

## Decision

- `README.md` is Kyle's GitHub profile (intro, stack badges, latest posts), not developer documentation. Developer docs live in `docs/`.
- `.github/workflows/blog-post-workflow.yml` runs every Sunday at 00:00 UTC (and on demand):
  - runs `scripts/update-readme.js`, which fetches the latest posts from Sanity;
  - opens a PR, "Update README with latest blog posts", on the `update-readme-with-blog-posts` branch.

## Options rejected

None recorded.

## Consequences

- Setup and architecture notes must not go in `README.md`.
- The workflow needs the repo secrets `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN`, `NEXT_PUBLIC_SITE_URL` and `AUTHOR_NAME`.
- The weekly PR has to be merged by hand.

## Links

affects:: [[repo/badger3000]]
uses:: [[service/sanity]]
