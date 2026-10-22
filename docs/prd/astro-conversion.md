---
slug: prd/badger3000-astro-conversion
title: badger3000 — Astro conversion & agent UI
status: active
date: 2026-10-21
---

# Astro conversion & agent UI

## Problem

The site currently runs on Next.js App Router ([ADR 0001](../adr/0001-nextjs-app-router.md)). Two things are changing at once:

1. **Framework** — move the frontend off Next.js to **Astro** (on Cloudflare), to ship far less JavaScript for what is a content site, simplify the build, and leave the Vercel/Next release cadence and its breaking changes behind.
2. **Experience** — re-skin the site as a **Badger3000 AI agent**: a calm, sleek chat-first UI where visitors *ask* about Kyle and the agent answers by rendering his real Sanity content as cards, with a browsable archive behind every answer.

The full visual design already exists as the source of truth in [`design/badger3000v2.pen`](../../design/badger3000v2.pen) — 25+ screens, three skins (light / dark / forest), a 20-component library, and per-element codegen context. This PRD specs how to turn that design into a shipping Astro app, and (separately) how to restructure the repo as a Turborepo monorepo. See also [designing-from-the-pen](../runbooks/designing-from-the-pen.md) and [turborepo-migration](../runbooks/turborepo-migration.md).

## Users

- **Hiring managers / clients** — ask the agent (or browse) for projects, experience, skills, recommendations; reach the contact action. Experience page still prints as a résumé.
- **Developers / readers** — articles, CodePen experiments, curated bookmarks, golf scores.
- **Kyle** — edits everything in Sanity Studio; the design lives in the `.pen` file and drives the code.

The content model and routes from the [personal-site PRD](./personal-site.md) are unchanged — this is a presentation + framework change, not a content change.

## Requirements

### Experience
- **Agent home** — empty state: greeting, prompt, suggestion chips, sidebar listing every content type.
- **Conversation** — the agent answers with rich cards (projects, articles, experience timeline, golf, …) grounded in Sanity; a docked composer.
- **Browse views** — clicking a sidebar item opens a filterable archive grid (Projects, Articles, Experiments, Skills, Testimonials, Bookmarks, Golf, Experience); each links back to chat via an "Ask Badger" affordance.
- **Mobile** — sidebar collapses to a hamburger **drawer** + bottom tab bar.
- **Theming** — light (default), dark, and forest skins via a `data-theme` attribute on `<html>`; a user toggle persists the choice.

### Chat (no vendor AI key)
See [ADR 0008](../adr/0008-agent-chat-grounded-no-vendor-key.md). Intent-first: classify → GROQ query to Sanity (+ a small bio/persona doc) → optional grounded one-line intro from **Cloudflare Workers AI** → `{ intent, text, cards[] }`. Falls back to deterministic phrasing if the model is unavailable. No OpenAI/Anthropic key; nothing leaves Cloudflare + Sanity.

### Platform
- **Must**: parity with today's content routes and SEO (`sitemap.xml`, `robots`, RSS), per-route metadata, contact form ([ADR 0003](../adr/0003-contact-form-resend-recaptcha.md)) reimplemented as an Astro endpoint / Worker, Sanity Studio still reachable.
- **Must**: static-first with on-demand/ISR-equivalent (Cloudflare cache + Sanity webhook rebuilds) for content pages; server rendering only for `/api/*`.
- **Should**: Core Web Vitals improve versus the Next build (less client JS).

### Design → code fidelity
- Tokens are ported verbatim from the pen **Design Tokens** board to CSS custom properties ([ADR 0006](../adr/0006-migrate-to-astro.md)).
- The 20 pen components map 1:1 to `.astro`/`.tsx` files; each element's `context` string (semantic tag · Component · props · `← sanityField`) is the implementation spec.

## Target architecture

```
Browser ──POST /api/chat──▶ Astro endpoint (Cloudflare Worker)
                              │  1 intent router  (keyword; LLM only if ambiguous)
                              │  2 retrieve  ──GROQ──▶ Sanity (content + bio doc)
                              │  3 compose   ──▶ Cloudflare Workers AI (grounded, optional)
                              ▼
                      { intent, text, cards[] } ──▶ client renders card components
Build time: Sanity webhook ──▶ Astro rebuild; browse pages prerendered & edge-cached.
```

Diagrammed in the pen as the **Chat Architecture** board (`xIXxz`).

## Phased plan

1. **Foundation** *(in progress, `apps/web`)* — Astro project, tokens → CSS vars, `Base` layout, first component (`Button`), theme switcher. Verifies the pipeline. (Built straight into `apps/web` since `/web` is a personal `.gitignore` entry.)
2. **Component library** — port the 20 components + organisms from the pen, driven by `context`. Visual parity against the pen screenshots.
3. **Content layer** — move Sanity schemas/client/GROQ into a shared package; build the static content routes (`/`, `/articles`, `/codepen`, `/experience`, `/bookmarks`) + the browse views.
4. **Agent** — `/api/chat` intent router + retrieval + grounded compose; wire the conversation UI; bio/persona doc added to Sanity.
5. **Platform** — Cloudflare adapter + deploy, SEO (sitemap/robots/RSS), contact endpoint, Studio.
6. **Monorepo** — restructure to Turborepo ([turborepo-migration](../runbooks/turborepo-migration.md)); can run in parallel once packages stabilize.
7. **Cutover** — promote `web/` (or `apps/web`) to the site, delete the Next app, repoint deploy, archive the old stack.

## Out of scope

- Content model changes, new content types.
- A self-hosted LLM or an Obsidian/vector "second brain" (reconsider only if a large personal-notes corpus is wanted — [ADR 0008](../adr/0008-agent-chat-grounded-no-vendor-key.md)).

## Open questions

- Package manager for the monorepo: **pnpm** recommended ([ADR 0007](../adr/0007-turborepo-monorepo.md)) — confirm before migrating lockfiles.
- Does Sanity Studio move to its own `apps/studio` + `sanity.studio` hosting, or stay embedded at `/studio` in the Astro app?
- Keep the `.pen` at repo root (`design/`) shared across packages, or in `packages/design`.

## Links

affects:: [[repo/badger3000]]
uses:: [[tech/astro]] [[tech/sanity]] [[tech/typescript]] [[service/cloudflare]]
supersedes:: [[adr/badger3000-nextjs-app-router]]
