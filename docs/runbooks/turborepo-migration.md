---
slug: runbook/badger3000-turborepo-migration
title: badger3000 — Turborepo monorepo migration
status: active
date: 2026-10-22
---

# Turborepo monorepo migration

Steps to restructure the repo into a pnpm + Turborepo monorepo ([ADR 0007](../adr/0007-turborepo-monorepo.md)). Do this on the `astro-conversion` branch (or a child of it) **after** the Astro web app under `web/` is stable, so you move working code, not a moving target. Each step ends green (`pnpm -w turbo run build lint typecheck`).

## 0. Prerequisites

- Node ≥ 22, **pnpm** (`corepack enable && corepack prepare pnpm@latest --activate`).
- A clean working tree. Work in the worktree at `../badger3000-astro`.

## 1. Root workspace scaffolding

`pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Root `package.json` (private, no app code):

```jsonc
{
  "name": "badger3000",
  "private": true,
  "packageManager": "pnpm@9",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": { "turbo": "^2" }
}
```

`turbo.json`:

```jsonc
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".astro/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "typecheck": { "dependsOn": ["^build"] }
  }
}
```

## 2. Move the web app → `apps/web`

```bash
mkdir -p apps
git mv web apps/web        # the Astro app built during the conversion
```

Give `apps/web` its own `package.json` (name `web`, Astro deps) if it doesn't have one yet.

## 3. Extract shared packages

Create `packages/{tokens,ui,sanity,config}`, each with a `package.json` named `@badger3000/<pkg>`.

- **`@badger3000/tokens`** — move `apps/web/src/styles/tokens.css` here; export the CSS and (optionally) a generated TS map. Ported from the pen **Design Tokens** board.
- **`@badger3000/ui`** — the 20 components (`Button`, `Tag`, `Avatar`, `NavItem`, `ProjectCard`, `Sidebar`, `TopBar`, `PageHeader`, `Composer`, …). Depends on `@badger3000/tokens`.
- **`@badger3000/sanity`** — move `schemas/`, `sanity.client.js`, `sanity.config.ts`, and GROQ queries here; export a typed client + query functions.
- **`@badger3000/config`** — shared `tsconfig.base.json`, eslint preset.

Wire dependencies with `workspace:*`:

```jsonc
// apps/web/package.json
"dependencies": {
  "@badger3000/ui": "workspace:*",
  "@badger3000/sanity": "workspace:*",
  "@badger3000/tokens": "workspace:*"
}
```

## 4. Extract the Studio → `apps/studio`

Pull the embedded Studio (currently `/studio`) into `apps/studio` as a standalone Sanity app that imports `@badger3000/sanity` for its schema. Decide hosting: `sanity deploy` (sanity.studio) or Cloudflare. (Open question in the PRD — may stay embedded short-term.)

## 5. Convert the lockfile npm → pnpm

```bash
rm -f package-lock.json
corepack use pnpm@latest
pnpm install          # writes pnpm-lock.yaml, links workspaces
```

## 6. Rewire imports

Replace deep relative imports (`../../components/Button`) with package imports (`@badger3000/ui`). Move `scripts/` (sitemap generation, etc.) next to the app that runs them or into a small package.

## 7. CI & deploy

- CI: `pnpm install --frozen-lockfile` then `pnpm turbo run build lint typecheck`. Scope with filters: `turbo run build --filter=web...`.
- Deploy `apps/web` to Cloudflare Pages/Workers (build command `pnpm turbo run build --filter=web`, output `apps/web/dist`). Add `wrangler`/adapter config for the `/api/chat` Worker + Workers AI binding.
- Retire `netlify.toml`.

## 8. Verify

```bash
pnpm install
pnpm turbo run build lint typecheck      # all green, cached on repeat
pnpm --filter web dev                     # app runs locally
```

## Rollback

The migration is a series of `git mv`s + config files on a branch; revert the branch or reset to the pre-migration commit. The old Next app remains on `master` untouched until cutover.

## Links

affects:: [[repo/badger3000]]
uses:: [[tech/turborepo]] [[tech/pnpm]]
