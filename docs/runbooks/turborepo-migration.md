---
slug: runbook/badger3000-turborepo-migration
title: badger3000 — Turborepo monorepo migration
status: active
date: 2026-10-22
---

# Turborepo monorepo migration

Steps to restructure the repo into a pnpm + Turborepo monorepo ([ADR 0007](../adr/0007-turborepo-monorepo.md)). The skeleton (B1, below) is **done** on `astro-dev`; the shared packages (B2+) are next. Every step ends green.

## Layout after B1

```
apps/web          @badger3000/web          Astro, Cloudflare Workers (Workers Builds)
apps/legacy-next  @badger3000/legacy-next  Next 16, Netlify, embedded /studio — deleted at cutover
packages/config   @badger3000/config       tsconfig.base.json, eslint/astro.js (not wired into apps/web yet)
packages/sanity   @badger3000/sanity       bookmark data scripts + data/ (B2: schemas, client, queries, types)
scripts/update-readme.js                   the only root script; the weekly README workflow runs it
netlify.toml                               root, base = "apps/legacy-next"
```

`extensions/bookmark-saver` has no `package.json` and is not a workspace member. `apps/studio`, `packages/tokens` and `packages/ui` come in B2/B3.

## Prerequisites

- `nvm use` (Node 24, `.nvmrc`). Every `package.json` says `"engines": {"node": ">=22.23.4"}`.
- pnpm 11 (`packageManager` in the root `package.json`; `corepack enable` if `pnpm` is missing).
- Env: `apps/web/.env` (copy `apps/web/.env.example`). Next reads the same `PUBLIC_*` names from `apps/legacy-next/.env.local`; a symlink `ln -s ../web/.env apps/legacy-next/.env.local` is enough.

## B1 — skeleton move (done)

Each step was one commit; run from the repo root.

1. **Delete dead files.** The CJS-under-ESM root scripts that crashed on line 1 (`check-content`, `list-content`, `test-*`, `verify-sanity`, `manual-update-readme`, the ESM sitemap twins), `scripts/README.md`, `sanity.client.js` and `rss-feed.xml`.
2. **Move Next to `apps/legacy-next`** with `git mv` (app, components, hooks, lib, types, schemas, public, configs, `sanity.*.ts`, `AGENTS.md`, `CHANGELOG.md`, `package.json`, `.env.example`; the three sitemap `.cjs` scripts into `apps/legacy-next/scripts/`). `next.config.mjs` sets `outputFileTracingRoot` and `turbopack.root` to the workspace root; `tsconfig.json` no longer excludes `apps`.
3. **pnpm workspace.** `pnpm-workspace.yaml` (`apps/*`, `packages/*`), one `pnpm-lock.yaml`, both npm lockfiles and `allowScripts` deleted. Build scripts approved with `pnpm approve-builds esbuild workerd unrs-resolver` (written to `allowBuilds` in `pnpm-workspace.yaml`).
4. **`packages/config` + `packages/sanity`** skeletons; the bookmark scripts and `data/` moved to `packages/sanity`.
5. **Turborepo.** `turbo.json` with `cacheDir: .turbo/cache` (per worktree), build `env`/`inputs` that include the git-ignored `.env` files, and `!dist/server/.dev.vars` in outputs so the local token never enters the cache.
6. **Netlify.** Root `netlify.toml` with `base = "apps/legacy-next"`, `command = "pnpm run build"`.
7. **CI.** `.github/workflows/ci.yml` runs `pnpm turbo run check lint typecheck build --filter='!@badger3000/legacy-next'` with `SANITY_ALLOW_EMPTY=1` (no secrets), plus lint + typecheck for legacy-next. The README workflow no longer uses `cache: npm`, and `update-readme.js` follows redirects.
8. **Docs and hygiene.** `.gitignore` (`node_modules/`, `.turbo/`, `.wrangler/`), `.vscode/launch.json`, this runbook, `CLAUDE.md`.

### Verify

```bash
pnpm install --frozen-lockfile
SANITY_ALLOW_EMPTY=1 pnpm turbo run check lint typecheck build --filter='!@badger3000/legacy-next'   # twice: 2nd is FULL TURBO
pnpm --filter @badger3000/legacy-next run lint
pnpm --filter @badger3000/legacy-next run typecheck
pnpm --filter @badger3000/legacy-next run build
git restore apps/legacy-next/public/sitemap*.xml apps/legacy-next/public/server-sitemap.xml
pnpm --filter @badger3000/web run sanity:check -- --parse
pnpm --filter @badger3000/web run deploy:dry
```

## Deploy hosts never use `turbo run`

Turbo hashes files and env, not Sanity content, so a content-only rebuild would get a cache hit and redeploy yesterday's output. Turbo's strict env mode also drops host build vars it isn't told about. Netlify and Workers Builds call the package script directly (`pnpm run build` in the app dir). Turbo is for local runs and CI. Don't enable remote caching.

## Next (B2+)

- **`@badger3000/tokens`**: `apps/web/src/styles/tokens.css` and a small TS map, from the pen **Design Tokens** board.
- **`@badger3000/ui`**: the presentational pen masters; the app shell stays in `apps/web`.
- **`@badger3000/sanity`**: `schemas/` (from `apps/legacy-next/schemas`), client, named GROQ queries, `sanity typegen`.
- **`apps/studio`**: standalone Studio, `sanity deploy` to `badger3000.sanity.studio`; `/studio` then redirects.
- Wire `@badger3000/config/eslint/astro` into `apps/web` and add a `lint` script there.
- Use `workspace:*` dependencies and package imports instead of deep relative paths.

## Rollback

B1 is a series of `git mv`s and config files on one branch: revert the merge commit on `astro-dev`. `master` (production) is untouched until cutover.

## Links

affects:: [[repo/badger3000]]
uses:: [[tech/turborepo]] [[tech/pnpm]]
