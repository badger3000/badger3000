---
slug: prd/badger3000-personal-site
title: badger3000 — personal site
status: active
date: 2026-10-22
---

# Personal site (badger3000.com)

## Problem

Kyle Ross needs one place that shows who he is and what he builds: writing, experiments, work history and a way to get in touch. It should be cheap to keep current, with content edited in a CMS rather than in code.

## Users

- **Hiring managers, recruiters and clients**: read the experience page (printable as a résumé), recommendations and skills, then make contact.
- **Developers and readers**: read articles, browse CodePen experiments and the curated bookmarks.
- **Kyle**: edits everything in Sanity Studio at `/studio`, and saves bookmarks from the browser with the Badger Bookmarks extension.
- **GitHub visitors**: this repo is also the GitHub profile repo, so its `README.md` is the profile page.

## Requirements

Current pages, all fed from Sanity:

| Route | Content |
| --- | --- |
| `/` | Latest 4 articles, experience, recommendations, contact form |
| `/articles`, `/articles/[slug]` | Articles with filtering |
| `/codepen`, `/codepen/[slug]` | CodePen showcases |
| `/experience` | Experience, education, skills; print stylesheet for a résumé |
| `/bookmarks` | Bookmarks with search and folder filtering |
| `/studio` | Embedded Sanity Studio |

- Must: light and dark themes; SEO metadata per route; `sitemap.xml`, `robots`, and an RSS feed at `/api/articles-feed`.
- Must: the contact form sends email and blocks bots ([ADR 0003](../adr/0003-contact-form-resend-recaptcha.md)).
- Should: the GitHub profile README lists the latest posts, updated weekly ([ADR 0005](../adr/0005-repo-is-github-profile.md)).

## Out of scope

None recorded.

## Open questions

None recorded.

## Links

affects:: [[repo/badger3000]]
