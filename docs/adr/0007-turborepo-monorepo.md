---
slug: adr/badger3000-turborepo-monorepo
title: badger3000 — Turborepo monorepo
status: accepted
date: 2026-10-22
---

# Turborepo monorepo

## Context

Today the repo is a single Next.js app with the Sanity Studio embedded at `/studio` and schemas, client, scripts and the design all mixed into one package. The [Astro conversion](../prd/astro-conversion.md) introduces clear, independently-shippable units — the public web app, the Studio, the design tokens, the shared UI components, and the Sanity data layer — that several targets want to consume. A monorepo makes those boundaries explicit and keeps builds fast with caching.

## Decision

- Adopt **Turborepo** with **pnpm workspaces** (`pnpm-workspace.yaml` + `turbo.json`). pnpm is chosen over npm/yarn for strict, fast, content-addressed installs that suit a monorepo.
- Target layout:

  ```
  badger3000/
    apps/
      web/      Astro site (portfolio + agent UI, /api/chat)
      studio/   Sanity Studio (extracted from embedded /studio)
    packages/
      tokens/   design tokens → CSS vars + TS (from the pen Design Tokens board)
      ui/       the 20 Astro/React components (the pen component library)
      sanity/   schemas + typed GROQ queries + @sanity/client wrapper
      config/   shared tsconfig / eslint presets
    design/     badger3000v2.pen — design source of truth (shared)
    docs/
  ```

- **Dependency direction**: `apps/*` depend on `packages/*`; `ui` depends on `tokens`; `web` depends on `ui` + `sanity` + `tokens`; `studio` depends on `sanity`. No cycles.
- `turbo.json` pipelines `build`, `dev`, `lint`, `typecheck`, `check` with proper `dependsOn` (`^build`) and `outputs` for caching.
- Deploy: `apps/web` → Cloudflare Pages/Workers; `apps/studio` → `sanity deploy` (or Cloudflare). Turbo filters scope CI to what changed (`turbo run build --filter=web...`).

## Options rejected

- **Single package (status quo)** — blurs the web/studio/schema boundaries and rebuilds everything on any change.
- **npm/yarn workspaces without Turbo** — workspaces alone, no task graph or remote caching.
- **Nx** — more powerful than needed for this size; Turbo is lighter and closer to the existing npm-script workflow.

## Consequences

- One-time migration cost: split the current package, move files into `packages/*`, convert the lockfile to pnpm, rewire imports to workspace packages (`@badger3000/ui`, …). Steps in [turborepo-migration](../runbooks/turborepo-migration.md).
- Scripts under `scripts/` (sitemap generation, etc.) move next to the app or into a package that owns them.
- CI changes from "build the app" to "turbo run … with filters"; caching makes repeat builds near-instant.
- The design `.pen` stays at the root so every package references one source of truth.

## Links

affects:: [[repo/badger3000]]
uses:: [[tech/turborepo]] [[tech/pnpm]] [[tech/astro]]
