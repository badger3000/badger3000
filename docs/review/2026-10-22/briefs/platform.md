# Lane: platform

Read `docs/review/2026-10-22/briefs/_common.md` first. Lane name for the report and signal: `platform`.

Also read `docs/runbooks/turborepo-migration.md`, `docs/runbooks/local-dev-and-deploy.md`, `docs/runbooks/deploy-astro-to-cloudflare.md`.

## Scope

1. **Monorepo layout.** Exact target tree for pnpm + Turborepo with `apps/{web,studio,legacy-next}` and `packages/{tokens,ui,sanity,config}`. For every top-level path in the repo today (`git ls-files | cut -d/ -f1 | sort -u`), say where it goes (move to which app/package, stay at root, delete). Note the root `README.md` is the GitHub profile README and must stay at root, and `.github/workflows/blog-post-workflow.yml` runs `scripts/update-readme.js` weekly.
2. **Moving Next to `apps/legacy-next`.** What breaks: `netlify.toml` (`base`, `publish`, `included_files`, functions patterns), `@netlify/plugin-nextjs` with pnpm (hoisting / `node-linker` / `public-hoist-pattern` needs), `tsconfig` paths `@/*`, `next.config.mjs`, eslint config, `prebuild` sitemap script paths, `.env.local` location, Sanity Studio at `/studio` (keep embedded in legacy until `apps/studio` ships?). Give the exact `netlify.toml` and any dashboard setting to change.
3. **Workspace config.** Draft `pnpm-workspace.yaml`, root `package.json`, `turbo.json` (tasks: build, dev, check, lint, typecheck; outputs for Astro `dist/**` + `.astro/**`, Next `.next/**` excluding cache; env vars that must be in `env`/`globalEnv` for cache correctness), `packages/config` (tsconfig base, eslint flat preset with Astro support). Account for `apps/web/scripts/node-guard.mjs`, `allowScripts` in `apps/web/package.json` (pnpm equivalent: `onlyBuiltDependencies`), Node version alignment (root `engines >=22.12`, `.nvmrc 24`, web `>=22.23.4`), package name `badger3000-web` vs filters.
4. **Root scripts triage.** Every file in `scripts/`: keep (where), move, delete — with reason.
5. **Parity endpoints & hosting.** For RSS (`/api/articles-feed` path must keep working for `update-readme.js`, plus `/rss.xml`), sitemap (`@astrojs/sitemap` vs endpoint), robots, `/api/contact` (Resend + reCAPTCHA on Workers — check the `resend` SDK works on workerd or use fetch), redirects (`public/_redirects` for Cloudflare; `/slidedeck/giga`; apex vs www — recommend one), `public/` assets to carry over, Studio hosting. Check the incident `docs/incidents/2026-10-11-contact-form-failing.md` so the port doesn't repeat it.
6. **CI.** Propose `.github/workflows/ci.yml` (pnpm cache, `turbo run build check lint typecheck` with filters, no secrets needed for a credential-less build) and how Cloudflare deploys (Workers Builds vs GH Action + wrangler).
7. **Stale docs.** List every place in `docs/`, `apps/web/README.md`, `CLAUDE.md` that will be wrong after the move or already is (e.g. runbook says package `web`, `sanity.client.js` is dead, component count).

## Proposal must include

- The ordered Phase B step list for the skeleton move (B1) — each step ending green, with the exact commands — so another agent can execute it verbatim.
