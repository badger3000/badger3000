---
slug: adr/badger3000-migrate-to-astro
title: badger3000 — migrate the frontend to Astro
status: accepted
date: 2026-10-21
---

# Migrate the frontend to Astro

## Context

The site has moved stacks before (Gatsby → Astro → Next.js, [ADR 0001](./0001-nextjs-app-router.md)). It is fundamentally a content site fed from Sanity, but the Next.js App Router ships a React runtime and hydration for pages that are mostly static, and Next 16 brings regular breaking changes (`AGENTS.md` exists only because of them). The redesign (an AI-agent UI, [PRD](../prd/astro-conversion.md)) is a natural moment to change framework.

## Decision

- Rebuild the frontend on **Astro** with the **Cloudflare** adapter. Astro ships zero JS by default and hydrates only interactive islands (the chat composer, theme toggle, filters).
- **Islands**: use Astro components for static UI; use a React (or vanilla) island only where state/events are needed. `/api/*` routes are Astro endpoints running on Cloudflare Workers.
- **Styling**: the design tokens from the pen **Design Tokens** board become CSS custom properties (`--a-*`), with skins switched by `[data-theme]` on `<html>`. Components use scoped CSS referencing those vars — no Tailwind required (it can be added later via `@tailwindcss/vite` if wanted).
- **Content**: keep Sanity; `@sanity/client` + GROQ are framework-agnostic and port unchanged. Content pages are static, revalidated by a Sanity webhook that triggers a rebuild, and edge-cached on Cloudflare (the ISR equivalent).
- **Hosting**: move from Netlify to **Cloudflare Pages/Workers** (co-located with Workers AI for the agent).

## Options rejected

- **Stay on Next.js** — keeps the heavy client runtime and breaking-change treadmill for a content site.
- **SvelteKit** — strong, but leaving React entirely loses reuse of existing React knowledge and the few needed interactive islands; Astro keeps React available where useful.
- **Remix / TanStack Start / Vite SPA** — still React-runtime-first or SPA; worse default performance and SEO for this content.

## Consequences

- Next-coupled pieces are replaced: `next/image` → Astro `<Image>`/Sanity CDN URLs; `next/font` → `<link>`/`@fontsource`; App Router → Astro file routing; route handlers → Astro endpoints; `metadata` export → per-page `<head>`; RSC/ISR → static + webhook rebuilds + edge cache.
- Interactivity is opt-in per island, so the burden is proving each interactive piece (composer, toggle) rather than the whole page.
- Deploy platform changes (Netlify → Cloudflare); `netlify.toml` is retired, a Cloudflare config/adapter is added.
- The design `.pen` plus per-element `context` act as the component spec, so the port is mechanical (see [designing-from-the-pen](../runbooks/designing-from-the-pen.md)).

## Links

affects:: [[repo/badger3000]]
uses:: [[tech/astro]] [[service/cloudflare]] [[tech/sanity]]
supersedes:: [[adr/badger3000-nextjs-app-router]]
