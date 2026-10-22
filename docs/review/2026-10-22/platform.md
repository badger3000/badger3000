# platform review

## Summary (5 lines max)
The skeleton move is mechanical, but four things will bite if B1 is executed as the current runbook says: (1) **no app can build without Sanity credentials** (both throw at build), so a "secret-free CI build" needs a small guard first; (2) Turbo's cache plus build-time Sanity fetches gives **stale deploys**, so deploy builds must skip Turbo; (3) the weekly README workflow breaks twice (`cache: npm` with no lockfile, and `http.get` not following an apex↔www redirect); (4) **11 of 21 root scripts already crash** (CJS under `"type": "module"`), including two that CLAUDE.md tells you to run.
Recommendations: **www is canonical**. Netlify is configured from a root `netlify.toml` with `base = "apps/legacy-next"`, which needs no dashboard change and stays branch-safe. Workers Builds deploys `apps/web`. PR #215 (the contact-form fix) is still unmerged on both `master` and `astro-dev`, so production's contact form is still broken.

## Findings
| # | sev | where (file:line or pen id) | problem | fix | effort |
|---|---|---|---|---|---|
| 1 | P0 | branch `fix/contact-form-resend` (b35a2c0) vs `master`/`astro-dev`; `netlify.toml:22` | PR #215 is merged nowhere (`git merge-base --is-ancestor` is false for both). The live contact form is still failing, `next.config.mjs:24` still strips `console.error` (so the logs stay empty), and `included_files` still lists `.env.local`. The incident's follow-ups can't start. | Merge #215 into `master` **before** B1, then merge `master` into `astro-dev`, so the move carries the fixed route and toml. Otherwise B1's `git mv` conflicts with #215's edits to `app/api/contact/route.ts`, `components/Contact.tsx`, `next.config.mjs` and `netlify.toml`. | S |
| 2 | P1 | `apps/web/src/lib/sanity/queries.ts:182-211`, `src/pages/*.astro` frontmatter (e.g. `skills.astro:17`); `lib/sanity.ts:10-16` | Neither app builds without credentials. Every Astro page `await`s `getClient().fetch` at prerender, and `getClient()` throws `MISSING`. Next's `lib/sanity.ts` throws at import. That contradicts CLAUDE.md, ADR 0010 and the `astro.config.mjs:27` comment ("credential-less builds work"), and blocks a secret-free CI. | Wrap each query in `queries.ts`: `const run = <T>(q: string, empty: T) => isConfigured ? getClient().fetch<T>(q) : (allowEmpty ? Promise.resolve(empty) : Promise.reject(new Error(MISSING)))`, where `allowEmpty = process.env.SANITY_ALLOW_EMPTY === "1"`. CI sets `SANITY_ALLOW_EMPTY=1`; deploy builds never do, so a misconfigured deploy still fails loudly. Leave Next alone: CI runs lint+typecheck only for legacy-next. | S |
| 3 | P1 | proposed `turbo.json`; `apps/web` build (content fetched at build) | Turbo hashes files and env, not Sanity content. A webhook-triggered rebuild with no code change gets a **cache hit and redeploys yesterday's `dist/`**. Seed #1 also means `dist/server/**` contains `SANITY_API_TOKEN`, so caching that output, and especially remote caching, copies the secret around. | Deploy builds (Netlify, Workers Builds) call the package script directly (`pnpm run build` in the app dir), never `turbo run`. Turbo is for local runs and CI only. Don't enable remote cache (`turbo login/link`) until seed #1 is fixed. | S |
| 4 | P1 | `scripts/*.js` (11 files) + root `package.json:5` `"type": "module"` | `check-content`, `list-content`, `test-articles`, `test-final`, `test-sanity*`, `verify-sanity`, `manual-update-readme`, `test-workflow` and `test-feed` use `require()` in `.js` under an ESM package, so they crash on line 1 (verified: `node scripts/test-feed.js` → `require is not defined`). CLAUDE.md lists `test-feed.js` and `verify-sanity.js` as verification steps. Five of them also query `_type == "post"`, which no schema defines. | Delete all 11 (triage below). Point CLAUDE.md at `apps/web` `sanity:check` and a `curl` feed check. | S |
| 5 | P1 | `.github/workflows/blog-post-workflow.yml:31`; `scripts/update-readme.js:8,24-27` | (a) `setup-node` `cache: "npm"` fails ("Dependencies lock file is not found") once `package-lock.json` is gone in B1. (b) The script reads only `NEXT_PUBLIC_SITE_URL`. (c) `http.get` treats any non-200 as failure, so a 301 between apex and www kills the weekly run the day the canonical host or the secret disagrees. | Drop the `cache:` line (the script uses only Node builtins). Read `PUBLIC_SITE_URL ?? NEXT_PUBLIC_SITE_URL`. Replace `fetchFeed` with `await fetch(url, {redirect: "follow"})` (Node 24). Rename the secret to `PUBLIC_SITE_URL` and set it to `https://www.badger3000.com`. | S |
| 6 | P1 | `apps/web/astro.config.mjs:18`, `apps/web/public/robots.txt:5`, `apps/web/.env.example:24`, root `.env.example` (`PUBLIC_SITE_URL=https://badger3000.com`) | The Astro side says the **apex** is canonical. Next (`next.config.mjs:42`, `app/robots.js:4`), `public/_redirects`, the committed sitemaps, `update-readme.js:9`, the reCAPTCHA note in the incident and the indexed URLs all say **www**. Canonical/OG/sitemap would flip hosts at cutover. | Use **www**: `site: "https://www.badger3000.com"`, robots `Sitemap: https://www.badger3000.com/sitemap-index.xml`, and both `.env.example` files `PUBLIC_SITE_URL=https://www.badger3000.com`. At cutover, add a Cloudflare Single Redirect Rule `badger3000.com/*` → `https://www.badger3000.com/${1}` 301 with query kept (apex DNS proxied). | S |
| 7 | P1 | `apps/web/public/robots.txt:5` | It advertises `/sitemap-index.xml`, which nothing generates (`@astrojs/sitemap` is not installed and `dist/` has no sitemap). Search Console's submitted URL is `/sitemap.xml` (Next). | Add `@astrojs/sitemap` (`integrations: [sitemap()]`, which needs `site`). Add `_redirects`: `/sitemap.xml /sitemap-index.xml 301` and `/server-sitemap.xml /sitemap-index.xml 301`. | S |
| 8 | P1 | `app/api/articles-feed/route.ts:52-55` → Astro has no `articles/[slug]`, `codepen/[slug]` (seed #5) | Feed items, and therefore the README's `BLOG-POST-LIST` links, point at `/articles/<slug>` and `/codepen/<slug>`. After cutover every README link 404s unless the slug routes ship first. | Make the slug routes a hard prerequisite of cutover (cross-lane). The Astro feed (below) builds item URLs from the same route helper the pages use. | M |
| 9 | P2 | `public/_redirects:1-2` | `http://badger3000.com/_` and `https://badger3000.com/_` are a markdown-mangled `/*` and only match the literal path `/_`, so they're dead. Apex→www works today only because of Netlify's primary-domain redirect. Cloudflare `_redirects` doesn't support host-absolute sources at all. | Don't port those lines. In `apps/web/public/_redirects` keep path rules only (sitemap aliases, `/studio`). Handle hosts with a Redirect Rule (finding 6). In legacy, fix them to `/*` or delete them; Netlify's domain setting already covers this. | S |
| 10 | P2 | `netlify.toml:17-28,13-14` | `[functions]` (`node_bundler`, `external_node_modules`, `included_files`) only applies to user functions in `netlify/functions/`, and there are none (the Next runtime bundles its own). `[functions.api-sitemap]` uses a `pattern` key Netlify doesn't define, and `app/api/sitemap/route.js` never reads `scripts/generate-sitemap.cjs`. `[build.processing] skip_processing` is deprecated. | Replace the file with the draft in Proposal §2. | S |
| 11 | P2 | `package-lock.json`, `apps/web/package-lock.json`, `apps/web/package.json:30-35` (`allowScripts`) | Two npm lockfiles, plus `allowScripts` (npm-only, pinned to exact versions, so it rots on every bump). Under pnpm ≥10, build scripts are blocked unless approved. The packages that need them are `esbuild`, `workerd` (web) and `unrs-resolver` (Next/eslint), plus `sharp` if Next pulls it. | Delete both lockfiles and `allowScripts`, then run `pnpm approve-builds esbuild workerd unrs-resolver sharp`. It writes the right key for the installed pnpm into `pnpm-workspace.yaml` (pnpm 11.18 is on this machine). Commit that. | S |
| 12 | P2 | root `package.json:6-8` `>=22.12.0`; `apps/web/package.json:7-9` `>=22.23.4`; `.nvmrc` `24` | Three Node statements. CI or Netlify could resolve a Node that Next accepts and Astro rejects. The machine default is v22.23.0, which fails Astro's floor. | Every `package.json` gets `"engines": {"node": ">=22.23.4"}`. Keep `.nvmrc` 24, `NODE_VERSION=24` (Netlify) and `node-version-file: .nvmrc` (CI). Keep `node-guard.mjs`; it walks up to find `.nvmrc`, so it still works from `apps/web`. Later, `useNodeVersion` in `pnpm-workspace.yaml` could replace it. | S |
| 13 | P2 | `docs/runbooks/turborepo-migration.md:60,100,101,109`; `apps/web/package.json:2` | The runbook filters on `web`, but the package is `badger3000-web`, so `--filter=web...` matches nothing. Turbo prints "No package found" and some versions exit 0, so CI goes green on nothing. | Rename the packages to `@badger3000/web`, `@badger3000/legacy-next`, `@badger3000/studio` and `@badger3000/{tokens,ui,sanity,config}`. Keep the wrangler `name: "badger3000-web"`, which is the Worker name, not the package. | S |
| 14 | P2 | `next.config.mjs` (no root settings) | After the move, Next sits two levels below the workspace root, with `node_modules` symlinked by pnpm. Next infers the root from the lockfile and warns, or traces wrong, while stray lockfiles exist. | In `apps/legacy-next/next.config.mjs`: `import {fileURLToPath} from "node:url"; const root = fileURLToPath(new URL("../..", import.meta.url));`, then `outputFileTracingRoot: root, turbopack: {root},`. | S |
| 15 | P2 | `.gitignore:34` (`CLAUDE.md`) | CLAUDE.md is git-ignored, though its own preamble says "checked into the codebase". Fresh clones, worktrees and the cloud review lanes don't get it. After B1 it describes the layout wrong, and the edits can't be reviewed in a PR. | Remove `CLAUDE.md` from `.gitignore` and commit it with the B1 doc updates (owner decision; see Open questions). | S |
| 16 | P2 | `app/api/articles-feed/route.ts:16-17`, `app/api/sitemap/route.js:6-7`, `scripts/import-bookmarks.mjs:26-34`, `scripts/migrate-bookmark-folders.mjs:18-26` | The ADR 0010 rename is incomplete. These read only `NEXT_PUBLIC_SANITY_*`, or `SANITY_PROJECT_ID`/`SANITY_TOKEN`, with no `PUBLIC_*` first. `grep NEXT_PUBLIC_` won't go quiet at cutover. | Use `PUBLIC_X ?? NEXT_PUBLIC_X` in both routes. In the moved bookmark scripts use `PUBLIC_SANITY_PROJECT_ID ?? SANITY_PROJECT_ID` and `SANITY_API_TOKEN ?? SANITY_TOKEN`. | S |
| 17 | P2 | `apps/web/.env.example:19-21`, `src/lib/sanity/client.ts:34-37` vs `docs/adr/0010-public-env-prefix.md` ("Production builds read published content over the CDN with no secret at all") | The ADR says prod builds need no secret. The code and template say the private dataset needs `SANITY_API_TOKEN` on every read, including the prod build. Combined with seed #1, the Worker bundle gets the token. | Amend ADR 0010 (or add ADR 0011): the dataset is private, so the token is a **build-time** secret, read via `astro:env/server` (`getSecret`) or `process.env` in prerender only, and never through `import.meta.env` in code reachable from `/api/*`. At runtime the Worker gets its own read token through `wrangler secret put SANITY_API_TOKEN`. | M |
| 18 | P2 | `apps/web/public/_headers:13-16` | `_headers` only applies to asset responses. `/api/chat`, and `/api/contact` once ported, are Worker responses, so they get no `nosniff`, `Referrer-Policy` or cache policy. ADR 0009 calls `_headers` load-bearing. | Set `X-Content-Type-Options`, `Cache-Control: no-store` and `Referrer-Policy` in a shared `jsonResponse()` helper used by every `src/pages/api/*.ts`. | S |
| 19 | P3 | `.vscode/launch.json:5` | It runs `./node_modules/.bin/astro dev` at the repo root, where Astro isn't installed. | Change it to `"command": "pnpm --filter @badger3000/web dev"`. | S |
| 20 | P3 | `rss-feed.xml`, `sanity.client.js` | `rss-feed.xml` is tracked output of `test-feed.js`. `sanity.client.js` has no importers (`git grep` finds only Studio importing `sanity.config`), but the runbook says to move it into `packages/sanity`. | `git rm` both in B1.1. | S |

## Proposal

### 1. Target tree, and where every top-level path goes

```
badger3000/
  README.md                 GitHub profile README (ADR 0005), stays
  CLAUDE.md                 stays (un-ignore; see F15)
  .github/workflows/        blog-post-workflow.yml (fixed) + ci.yml (new)
  scripts/update-readme.js  only root script left; run by the weekly workflow from repo root
  .nvmrc  .gitignore  .vscode/  .pi/
  package.json  pnpm-workspace.yaml  pnpm-lock.yaml  turbo.json
  netlify.toml              root, base = apps/legacy-next (delete at cutover)
  design/badger3000v2.pen   stays
  docs/                     stays
  extensions/bookmark-saver/  stays: unpacked Chrome extension, no build, no package.json, so not a workspace member
  apps/
    web/          @badger3000/web (Astro, Workers)
    legacy-next/  @badger3000/legacy-next (Next 16, Netlify, embedded /studio until apps/studio ships)
    studio/       @badger3000/studio (B2+; `sanity deploy`)
  packages/
    config/       @badger3000/config (tsconfig.base.json, eslint presets)
    sanity/       @badger3000/sanity (B1: bookmark data scripts; B2: schemas, client, queries, types)
    tokens/       @badger3000/tokens (B2)
    ui/           @badger3000/ui (B3)
```

| today (`git ls-files \| cut -d/ -f1`) | B1 destination |
|---|---|
| `.env.example` | → `apps/legacy-next/.env.example` (Next loads env from its own dir); fix `PUBLIC_SITE_URL` to www |
| `.github/` | stays; fix `blog-post-workflow.yml`, add `ci.yml` |
| `.gitignore` | stays; `/node_modules` → `node_modules/`, add `.turbo/`, `.wrangler/`, remove `CLAUDE.md` |
| `.nvmrc` | stays (24) |
| `.pi/` | stays (pencil MCP config for the pi agent) |
| `.vscode/` | stays; fix `launch.json` (F19) |
| `AGENTS.md` | → `apps/legacy-next/AGENTS.md` (`next dev` rewrites it in the Next project dir) |
| `CHANGELOG.md` | → `apps/legacy-next/CHANGELOG.md` (Next-era 1.3.3, last touched 2025-09) |
| `README.md` | **stays** (profile README; workflow rewrites `BLOG-POST-LIST`) |
| `app/` `components/` `hooks/` `lib/` `types/` | → `apps/legacy-next/` |
| `apps/` | stays (`apps/web` is already in place) |
| `data/` | → `packages/sanity/data/` (keeps the `../data/bookmarks.json` relative path of the bookmark scripts) |
| `design/` | stays |
| `docs/` | stays |
| `eslint.config.js` | → `apps/legacy-next/eslint.config.js` |
| `extensions/` | stays |
| `netlify.toml` | stays at root, rewritten (§2) |
| `next-env.d.ts` `next.config.mjs` `postcss.config.cjs` `tsconfig.json` | → `apps/legacy-next/` (`@/*` → `./*` is relative to the tsconfig, so it keeps working; drop `"exclude": ["apps"]`) |
| `package.json` | → `apps/legacy-next/package.json` (renamed); a new workspace root `package.json` is written |
| `package-lock.json` | moved with Next in B1.2, deleted in B1.3 |
| `public/` | → `apps/legacy-next/public/` (Astro port list in §5) |
| `rss-feed.xml` | delete |
| `sanity.cli.ts` `sanity.config.ts` | → `apps/legacy-next/` (embedded Studio stays until `apps/studio` ships) |
| `sanity.client.js` | delete (dead) |
| `schemas/` | → `apps/legacy-next/schemas/` in B1; → `packages/sanity/schemas/` in B2 (one move per PR, Studio stays green) |
| `scripts/` | split per §4 |

### 2. Moving Next to `apps/legacy-next`, and Netlify

**Dashboard check before merging:** Site configuration → Build & deploy → Build settings: **Base directory empty, Package directory empty** (a UI value would override the file). With those empty, Netlify reads the root `netlify.toml` of *each branch*, so `master` keeps building the old layout until B1 merges. Also enable **Branch deploys** for `chore/monorepo-skeleton` (Branches and deploy contexts → "Let me add individual branches"), because a PR into `astro-dev` doesn't get a deploy preview by default.

Root `netlify.toml` (replaces the current one):

```toml
# Legacy Next app (apps/legacy-next) — serves production until the Astro cutover.
# Deleted at cutover. The Astro app deploys to Cloudflare, not here.
[build]
base    = "apps/legacy-next"
# Direct package script, not `turbo run`: Turbo's strict env mode would strip
# Netlify's build vars, and a cache hit would skip the Sanity sitemap/content fetch.
command = "pnpm run build"
publish = ".next"
# Skip builds when nothing the legacy app depends on changed (runs from base).
ignore  = "git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF -- . ../../packages ../../pnpm-lock.yaml ../../pnpm-workspace.yaml ../../netlify.toml"

[build.environment]
NODE_VERSION = "24"
NEXT_TELEMETRY_DISABLED = "1"
NODE_OPTIONS = "--max_old_space_size=1024"

[[headers]]
for = "/_next/static/*"
[headers.values]
Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
for = "/images/*"
[headers.values]
Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
for = "/api/*"
[headers.values]
Cache-Control = "public, max-age=3600, stale-while-revalidate=86400"
X-Content-Type-Options = "nosniff"

[[headers]]
for = "/sitemap*.xml"
[headers.values]
Content-Type = "application/xml"
Cache-Control = "public, max-age=3600, stale-while-revalidate=86400"
X-Content-Type-Options = "nosniff"

[[headers]]
for = "/server-sitemap.xml"
[headers.values]
Content-Type = "application/xml"
Cache-Control = "public, max-age=3600, stale-while-revalidate=86400"
X-Content-Type-Options = "nosniff"

[[plugins]]
package = "@netlify/plugin-nextjs"
```

Notes:
- Netlify picks pnpm from `pnpm-lock.yaml` plus `packageManager`, and `pnpm install` run from a workspace member installs the whole workspace. **Check the first branch-deploy log** for `pnpm install`. If it shows `npm install`, use the fallback: UI Base directory = empty, **Package directory = `apps/legacy-next`**, move the toml to `apps/legacy-next/netlify.toml` with `command = "pnpm --filter @badger3000/legacy-next build"` and `publish = "apps/legacy-next/.next"`. Make that UI change in the same minute the PR merges to `master`, because UI settings apply to every branch.
- `@netlify/plugin-nextjs` (v5/OpenNext) works with pnpm's isolated linker, and Next has no phantom deps: I checked every bare import in `app components hooks lib types schemas sanity.*` against `package.json`, and none is undeclared. **Start strict.** If the function bundle fails with `Cannot find module 'styled-components'` (Studio peer) or similar, first add `publicHoistPattern: ["*styled-components*", "*sanity*"]` to `pnpm-workspace.yaml`. Only then, as a last resort, use `nodeLinker: hoisted`, which is workspace-wide and also loosens `apps/web`.
- `.env.local` → `apps/legacy-next/.env.local` (manual `mv`, it's untracked). `scripts/generate-sitemap.cjs` uses `dotenv.config({path: ".env.local"})` and `process.cwd()/public`. pnpm runs scripts in the package dir, so `prebuild` keeps working when it moves to `apps/legacy-next/scripts/`. Optional: `ln -s ../legacy-next/.env.local apps/web/.env`, since both read the same `PUBLIC_*` names.
- Studio at `/studio` stays embedded in legacy-next until `apps/studio` is deployed with `sanity deploy` (badger3000.sanity.studio). Then add to Astro `_redirects`: `/studio https://badger3000.sanity.studio 302` and `/studio/* https://badger3000.sanity.studio/:splat 302`. Add both `https://www.badger3000.com` and the workers.dev host to Sanity CORS only if a browser client ever reads Sanity (today it doesn't).
- Eslint: `apps/legacy-next/eslint.config.js` moves unchanged. Its `extensions/**` and `schemas/**` ignores become harmless; `schemas/**` still matters.

### 3. Workspace config drafts

`pnpm-workspace.yaml`
```yaml
packages:
  - apps/*
  - packages/*
# Written by `pnpm approve-builds esbuild workerd unrs-resolver sharp` —
# pnpm 11 records approvals here (key name depends on pnpm version; let the command write it).
allowBuilds:
  esbuild: true
  workerd: true
  unrs-resolver: true
  sharp: true
```

Root `package.json`
```json
{
  "name": "badger3000",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.18.0",
  "engines": { "node": ">=22.23.4" },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "check": "turbo run check",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "verify": "turbo run build check lint typecheck"
  },
  "devDependencies": { "turbo": "^2" }
}
```
(`"type": "module"` stays because `scripts/update-readme.js` uses `import`.)

`turbo.json`
```json
{
  "$schema": "https://turborepo.com/schema.json",
  "globalDependencies": [".nvmrc"],
  "globalEnv": ["NODE_ENV", "SANITY_ALLOW_EMPTY"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "env": ["PUBLIC_*", "NEXT_PUBLIC_*", "SANITY_STUDIO_*", "SANITY_API_TOKEN", "SITE_URL", "CHAT_MODEL_TIER"],
      "outputs": [
        "dist/**", ".astro/**",
        ".next/**", "!.next/cache/**",
        "public/sitemap.xml", "public/sitemap-0.xml", "public/server-sitemap.xml"
      ]
    },
    "check":     { "dependsOn": ["^build"], "outputs": [".astro/**"] },
    "typecheck": { "dependsOn": ["^build"], "outputs": [] },
    "lint":      { "outputs": [] },
    "dev":       { "cache": false, "persistent": true }
  }
}
```
- `SANITY_API_TOKEN` is in `env` because it changes the output (seed #1 inlines it). Listing it makes Turbo hash it; Turbo doesn't store the value. Remote cache stays off (F3).
- Turbo 2 runs in strict env mode: vars not listed are **not passed** to tasks. That's another reason the deploy hosts call package scripts directly.
- `node-guard.mjs` keeps working under Turbo/pnpm: it's the package script, it reads its own `package.json` `engines`, and it walks up for `.nvmrc`. Change `"deploy": "npm run build && …"` → `"pnpm run build && pnpm run deploy:worker"` and the same in `deploy:dry`.

`packages/config/package.json`
```json
{
  "name": "@badger3000/config",
  "private": true,
  "type": "module",
  "exports": {
    "./tsconfig.base.json": "./tsconfig.base.json",
    "./eslint/astro": "./eslint/astro.js"
  },
  "peerDependencies": {
    "eslint": "^10", "typescript-eslint": "^8", "eslint-plugin-astro": "^1", "globals": "^17"
  }
}
```
`packages/config/tsconfig.base.json` (for `packages/*` sources consumed as raw TS; apps extend their framework preset first: `"extends": ["astro/tsconfigs/strict", "@badger3000/config/tsconfig.base.json"]`)
```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler",
    "strict": true, "skipLibCheck": true, "isolatedModules": true,
    "verbatimModuleSyntax": true, "allowImportingTsExtensions": true, "noEmit": true,
    "forceConsistentCasingInFileNames": true, "resolveJsonModule": true
  }
}
```
`packages/config/eslint/astro.js` (wired into `apps/web` in B2, not B1, because B1 must end green and `apps/web` has never been linted)
```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist/**", ".astro/**", ".wrangler/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  { languageOptions: { globals: { ...globals.browser } } },
  { files: ["scripts/**", "astro.config.mjs"], languageOptions: { globals: { ...globals.node } } },
  { rules: { "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }] } },
);
```

### 4. Root `scripts/` triage

| file | verdict | reason |
|---|---|---|
| `update-readme.js` | **keep at root `scripts/`** | The weekly workflow runs it from the root and writes the root `README.md`. Fix per F5. |
| `manual-update-readme.js` | delete | Duplicate of update-readme; CJS under ESM, so it crashes |
| `test-workflow.js` | delete | Crashes the same way; writes junk `local-feed.xml`/`test-README.md` |
| `test-feed.js` | delete | Crashes the same way; writes the tracked `rss-feed.xml`. Replace with `curl -fsS "$URL/api/articles-feed" \| xmllint --noout -` in the runbook |
| `check-content.js`, `list-content.js`, `test-articles.js`, `test-final.js` | delete | Crash the same way; superseded by `apps/web` `npm run sanity:check` |
| `test-sanity.js`, `test-sanity-auth.js`, `test-sanity-final.js`, `verify-sanity.js` | delete | Crash the same way; query the nonexistent `post` type; `test-sanity-auth.js:14` prints a token prefix |
| `generate-sitemap.js`, `test-sitemap.js` | delete | Unused ESM twins of the `.cjs` versions that `package.json` uses |
| `generate-sitemap.cjs` | → `apps/legacy-next/scripts/` | The `prebuild` script; delete at cutover (`@astrojs/sitemap` replaces it) |
| `test-sitemap.cjs`, `test-sitemap-status.cjs` | → `apps/legacy-next/scripts/` | `test:sitemap*` scripts; `@xmldom/xmldom` stays a legacy devDep; delete at cutover |
| `import-bookmarks.mjs`, `parse-bookmarks.mjs`, `migrate-bookmark-folders.mjs` | → `packages/sanity/scripts/` (with `data/` → `packages/sanity/data/`) | Framework-free Sanity data ops (ADR 0004); the `../data` relative path is kept; fix env names per F16 |
| `README.md` | delete; replace with a 5-line README in `packages/sanity/scripts/` | Describes the deleted scripts |

### 5. Parity endpoints and hosting (Astro side, Phase B/C backlog)

- **RSS.** Add `@astrojs/rss`. `src/lib/feed.ts` builds the feed from a new `feedQuery` in `queries.ts` (articles + codepen, `defined(slug.current)`, newest 10), with item links from the same slug-route helper the pages use (F8). Two prerendered endpoints share it: `src/pages/rss.xml.ts` and `src/pages/api/articles-feed.ts` (`export { GET } from "../rss.xml.ts"`). The second emits an extensionless `dist/api/articles-feed`, so add `_headers`: `/api/articles-feed` → `Content-Type: application/rss+xml; charset=utf-8`. The feed then updates only on a rebuild, which is fine with the Sanity webhook deploy hook (below).
- **Sitemap.** `@astrojs/sitemap` (it knows every prerendered route, including `getStaticPaths` slugs) plus the `_redirects` aliases in F7. Don't hand-roll an endpoint.
- **Robots.** Static `public/robots.txt` on www (F6). Add `Disallow: /studio/` while `/studio` redirects.
- **`/api/contact`.** `src/pages/api/contact.ts`, `prerender = false`. Port the **PR #215** version, not master's: env check up front, validation, `escapeHtml`, URL-encoded siteverify, action check, `RECAPTCHA_MIN_SCORE`, and errors logged with `console.error`. Workers keeps console output, and `observability.enabled` is already on in `wrangler.jsonc`, so the root cause of the incident (stripped logs) can't recur. Call Resend with **plain `fetch`** (`POST https://api.resend.com/emails`, `Authorization: Bearer ${RESEND_API_KEY}`). The `resend` SDK is fetch-based and Resend documents Workers use, but `fetch` adds 0 KB and leaves no doubt about `nodejs_compat`. Declare `RESEND_API_KEY`, `RECAPTCHA_SECRET_KEY`, `OWNER_EMAIL` and `CONTACT_FORM_EMAIL` in `env.schema` as `context: "server", access: "secret"`, read them via `astro:env/server`, and set them with `wrangler secret put`, **not** as build vars. In reCAPTCHA admin, allow `www.badger3000.com` and the workers.dev host.
- **Redirects.** `/slidedeck/giga` needs no rule: `public/slidedeck/giga/index.html` plus `html_handling: auto-trailing-slash` serves it. Copy `public/slidedeck/` as is. Host redirects use a Cloudflare Redirect Rule (F6, F9).
- **`public/` to carry over** to `apps/web/public/`: `icons/` (apple-touch, 192, 512), `favicon.ico` (keep `favicon.svg` too), `manifest.json` (theme/background colors from tokens; that's for the design lane), `slidedeck/`, `video/` only if a page uses it (check), and `images/` only for the files the Astro pages reference. **Don't** carry `sitemap*.xml`, `server-sitemap.xml` or `_redirects`.
- **Studio.** `apps/studio` with `sanity deploy` (badger3000.sanity.studio). It's free, and Sanity hosts auth. Cloudflare would mean building and hosting an SPA for no gain.
- **Cloudflare deploy: Workers Builds** (Git integration), not a GH Action. There's no `CLOUDFLARE_API_TOKEN` in GitHub, and you get per-branch preview URLs. Settings: Root directory `apps/web`; Build command `pnpm run build`; Deploy command `pnpm run deploy:worker` (keeps node-guard); Non-production branch deploy command `pnpm exec wrangler versions upload`; Build watch paths `apps/web/*`, `packages/*`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`; Build variables `NODE_VERSION=24`, `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET=badger3000`, `PUBLIC_SITE_URL=https://www.badger3000.com`, and secret `SANITY_API_TOKEN` (build-only, after the seed #1 fix). For the Sanity webhook, point a GROQ-powered webhook (on publish of `articles|codepen|projects|…`) at a Workers Builds deploy hook. If deploy hooks aren't available on the plan, use a `repository_dispatch` → workflow that calls the Cloudflare API.

### 6. CI: `.github/workflows/ci.yml`

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [master, astro-dev]
permissions:
  contents: read
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
jobs:
  verify:
    runs-on: ubuntu-latest
    env:
      SANITY_ALLOW_EMPTY: "1"          # credential-less build (needs F2's guard)
      TURBO_TELEMETRY_DISABLED: "1"
      NEXT_TELEMETRY_DISABLED: "1"
      ASTRO_TELEMETRY_DISABLED: "1"
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0               # --affected needs the merge base
      - uses: pnpm/action-setup@v4     # version from packageManager
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - uses: actions/cache@v4
        with:
          path: .turbo/cache
          key: turbo-${{ runner.os }}-${{ github.sha }}
          restore-keys: turbo-${{ runner.os }}-
      # legacy-next needs Sanity creds to build (lib/sanity.ts throws), and Netlify
      # builds it anyway — CI lints/typechecks it only.
      - name: Verify
        run: >
          pnpm turbo run check lint typecheck build
          --filter='!@badger3000/legacy-next' ${{ github.event_name == 'pull_request' && '--affected' || '' }}
      - name: Verify legacy-next (no build)
        run: >
          pnpm turbo run lint typecheck --filter=@badger3000/legacy-next
          ${{ github.event_name == 'pull_request' && '--affected' || '' }}
```
There are no secrets in CI. Deploys happen in Netlify and Workers Builds, never here.

### 7. Stale docs (wrong now or after B1)

- `CLAUDE.md`: git-ignored (F15). Root `npm run …` commands → `pnpm --filter @badger3000/legacy-next …`. `node scripts/test-feed.js` and `node scripts/verify-sanity.js` already crash (F4). "`packages/*` mean `apps/web/src/*` today" becomes false once packages exist. "the Next app at the repo root" → `apps/legacy-next`. "Separate `package.json`/lockfile — run its commands from inside `apps/web`" → one `pnpm-lock.yaml`. "`.env.local` at root" → `apps/legacy-next/.env.local`.
- `docs/runbooks/turborepo-migration.md`: line 10 says `astro-conversion` branch and `web/` (actually `astro-dev`, `apps/web`); line 15 says worktree `../badger3000-astro`; `packageManager: pnpm@9` (machine has 11.18); line 60 says package name `web` (it's `badger3000-web`); line 67 says "20 components" (there are 30 in `apps/web/src/components`); line 68 says to move `sanity.client.js` (dead); line 101 says "Cloudflare Pages/Workers" and `--filter=web` (Pages is unsupported, ADR 0009); step 7 says "Retire `netlify.toml`" (wrong: legacy-next stays on Netlify until cutover); step 5 runs `rm -f package-lock.json` only at root (misses `apps/web/package-lock.json`); `apps/legacy-next` is missing from the plan entirely. Replace it with §B1 below.
- `docs/runbooks/local-dev-and-deploy.md`: npm and `package-lock.json`, `npm install` / `npm run dev` at root, `.env.local` at root, `[`.env.example`](../.env.example)` (wrong relative link even today; it should be `../../.env.example`), and `node scripts/test-feed.js` / `verify-sanity.js` (broken).
- `docs/runbooks/deploy-astro-to-cloudflare.md`: "assets-only Worker", "hand-written `assets` block" and "`not_found_handling`" are stale since the adapter landed (`wrangler.jsonc` has no `assets`); "To switch on server rendering… install `@astrojs/cloudflare`" is already done; the `npm install-scripts approve … allowScripts` step → `pnpm approve-builds`; `cd apps/web && npm install` → `pnpm install` at root.
- `apps/web/README.md`: "PRD phase 1 … foundation only"; "Workers Static Assets worker … no Worker script yet"; the "follow the comment at the top of `astro.config.mjs`: add `@astrojs/cloudflare`" step (already done); the Layout block lists 3 components ("pages/ routes (home + 404 today)"); the "Not built yet" table (phases 2–4 are largely built); the `ProjectCard claims project.excerpt` note (verify with the design lane); npm commands.
- `docs/adr/0007-turborepo-monorepo.md`: the layout lacks `apps/legacy-next`; "Cloudflare Pages/Workers"; `--filter=web...`; "the 20 Astro/React components" (no React in `apps/web`). Amend, don't rewrite: add a "Revised 2026-10-22" note.
- `docs/adr/0009-static-first-cloudflare-worker.md`: describes no adapter / assets-only. The adapter now exists, so mark it "phase 4 reached, adapter in" in a dated note. Its "worker lives at `badger3000-web.<account>.workers.dev`" stays true.
- `docs/adr/0010-public-env-prefix.md`: "Production builds read published content over the CDN with no secret" is false for a private dataset (F17). "`.env.local` is written once for the repo" → per app after B1.
- `docs/adr/0006-migrate-to-astro.md:20`: "Cloudflare Pages/Workers" → Workers.
- `docs/prd/astro-conversion.md:80`: the Studio open question should be answered (`apps/studio` + `sanity deploy`).
- `docs/incidents/2026-10-11-contact-form-failing.md`: says PR #215 "opened 2026-10-12" and status open. It's still unmerged ten days later, so the follow-up owner and date should go in.
- `scripts/README.md`: describes 12 scripts that are deleted in B1.

### B1 — skeleton move, ordered (each step ends green; run verbatim from the repo root)

**B1.0 Preconditions and baseline**
```bash
git switch master && git pull --ff-only          # PR #215 must already be merged (F1)
git switch astro-dev && git pull --ff-only && git merge --no-edit master
git switch -c chore/monorepo-skeleton
nvm use                                           # Node 24
pnpm --version                                    # expect 11.x (corepack enable if missing)
npm ci && npm run lint && npm run typecheck && npm run build
git restore public/sitemap.xml public/sitemap-0.xml public/server-sitemap.xml
(cd apps/web && npm ci && npm run check && npm run build)
```
Green = all of the above exit 0. (The Next build needs `.env.local`; the Astro build needs `apps/web/.env`.)

**B1.1 Delete dead files**
```bash
git rm scripts/check-content.js scripts/list-content.js scripts/test-articles.js scripts/test-final.js \
       scripts/test-sanity.js scripts/test-sanity-auth.js scripts/test-sanity-final.js scripts/verify-sanity.js \
       scripts/manual-update-readme.js scripts/test-workflow.js scripts/test-feed.js \
       scripts/generate-sitemap.js scripts/test-sitemap.js scripts/README.md \
       sanity.client.js rss-feed.xml
npm run lint && npm run typecheck && npm run build && git restore public/sitemap*.xml public/server-sitemap.xml
git commit -m "chore: delete dead root scripts, sanity.client.js and rss-feed.xml"
```

**B1.2 Move Next to `apps/legacy-next` (still on npm)**
```bash
mkdir -p apps/legacy-next/scripts
git mv app components hooks lib types schemas public \
       next.config.mjs next-env.d.ts postcss.config.cjs tsconfig.json eslint.config.js \
       sanity.config.ts sanity.cli.ts AGENTS.md CHANGELOG.md package.json package-lock.json .env.example \
       apps/legacy-next/
git mv scripts/generate-sitemap.cjs scripts/test-sitemap.cjs scripts/test-sitemap-status.cjs apps/legacy-next/scripts/
[ -f .env.local ] && mv .env.local apps/legacy-next/.env.local
rm -rf .next tsconfig.tsbuildinfo node_modules
```
Edits:
- `apps/legacy-next/package.json`: `"name": "@badger3000/legacy-next"`, `"engines": {"node": ">=22.23.4"}`.
- `apps/legacy-next/tsconfig.json`: remove `"apps"` from `exclude`.
- `apps/legacy-next/next.config.mjs`: add `outputFileTracingRoot` / `turbopack.root` (F14).
- Root: create a temporary `package.json` with `{"name":"badger3000","private":true,"type":"module"}` so `scripts/update-readme.js` still runs as ESM.
```bash
(cd apps/legacy-next && npm ci && npm run lint && npm run typecheck && npm run build \
  && git restore public/sitemap*.xml public/server-sitemap.xml)
node --check scripts/update-readme.js
git add -A && git commit -m "chore: move the Next app to apps/legacy-next"
```

**B1.3 pnpm workspace**
- Create `pnpm-workspace.yaml` (§3, `packages` only for now).
- Replace root `package.json` with §3's, without `turbo` yet: scripts temporarily `"build": "pnpm -r run build"`.
- `apps/web/package.json`: `"name": "@badger3000/web"`, delete `allowScripts`, `npm run` → `pnpm run` in `deploy`/`deploy:dry`.
```bash
git rm apps/legacy-next/package-lock.json apps/web/package-lock.json
rm -rf apps/*/node_modules
pnpm install
pnpm approve-builds esbuild workerd unrs-resolver sharp
pnpm install --frozen-lockfile
pnpm --filter @badger3000/legacy-next run lint
pnpm --filter @badger3000/legacy-next run typecheck
pnpm --filter @badger3000/legacy-next run build && git restore apps/legacy-next/public/sitemap*.xml apps/legacy-next/public/server-sitemap.xml
pnpm --filter @badger3000/web run check
pnpm --filter @badger3000/web run build
pnpm --filter @badger3000/web run deploy:dry
git add -A && git commit -m "chore: pnpm workspace, one lockfile"
```
If the Next build fails on an unresolvable module, apply the `publicHoistPattern` fallback (§2) and re-run this step.

**B1.4 `packages/config` + `packages/sanity` skeletons**
```bash
mkdir -p packages/config/eslint packages/sanity/scripts
# write packages/config/{package.json,tsconfig.base.json,eslint/astro.js} from §3
git mv scripts/import-bookmarks.mjs scripts/parse-bookmarks.mjs scripts/migrate-bookmark-folders.mjs packages/sanity/scripts/
git mv data packages/sanity/data
```
`packages/sanity/package.json`: `{"name":"@badger3000/sanity","private":true,"type":"module","dependencies":{"@sanity/client":"^8.10.1"}}`. Apply the F16 env-name fallbacks in the three scripts.
```bash
pnpm install
for f in packages/sanity/scripts/*.mjs; do node --check "$f"; done
git add -A && git commit -m "chore: packages/config and packages/sanity skeletons"
```

**B1.5 Turborepo**
```bash
pnpm add -Dw turbo
# write turbo.json from §3; root scripts → turbo run … (§3)
pnpm turbo run check lint typecheck build
pnpm turbo run check lint typecheck build   # second run: expect ">>> FULL TURBO"
git add -A && git commit -m "chore: turbo task graph"
```

**B1.6 Netlify**
- Replace root `netlify.toml` with §2.
- Dashboard: confirm Base and Package directory are empty, and add a branch deploy for `chore/monorepo-skeleton`.
```bash
git commit -am "chore(netlify): build legacy-next from apps/legacy-next" && git push -u origin chore/monorepo-skeleton
```
Green = the branch deploy log shows `pnpm install` and `@netlify/plugin-nextjs` succeeds. Then on the branch URL: `/`, an article, `/bookmarks`, `/studio`, `/api/articles-feed` (200, XML) and `/sitemap.xml`.

**B1.7 CI + README workflow**
- Add `.github/workflows/ci.yml` (§6). Until F2's guard lands, temporarily drop `build` for `@badger3000/web` from the filter or add F2 in this step.
- `blog-post-workflow.yml`: delete `cache: "npm"`, set `PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}`.
- `scripts/update-readme.js`: F5 changes.
```bash
PUBLIC_SITE_URL=https://www.badger3000.com node scripts/update-readme.js && git diff --stat README.md && git restore README.md
git add -A && git commit -m "ci: turbo verify workflow; README workflow survives pnpm"
```
Green = the PR's CI run passes, plus `gh workflow run blog-post-workflow.yml --ref chore/monorepo-skeleton` succeeds (it opens a PR against master; close it).

**B1.8 Hygiene and docs**
- `.gitignore`: `node_modules/`, `.turbo/`, `.wrangler/`, drop `CLAUDE.md` (if the owner agrees).
- `.vscode/launch.json` (F19).
- Rewrite `docs/runbooks/turborepo-migration.md` to this B1 list.
- Update `local-dev-and-deploy.md`, `deploy-astro-to-cloudflare.md`, `apps/web/README.md` and `CLAUDE.md` per §7.
```bash
pnpm turbo run check lint typecheck build
git add -A && git commit -m "docs: monorepo layout, pnpm commands" && gh pr create --base astro-dev --draft
```

## Cross-lane notes
- Seed #1 (token in the Worker bundle) also makes `dist/server/**` a Turbo cache output, so the token is copied into `.turbo/cache` and into any remote cache. Fix it before enabling the remote cache (security lane).
- Feed/README links need the `articles/[slug]` and `codepen/[slug]` routes before cutover (seed #5, frontend lane).
- `/api/chat` responses miss the security headers `_headers` gives assets (F18, API lane).
- `manifest.json` `theme_color`/`background_color` should come from tokens when it's ported (design lane).

## Open questions for the owner
1. www as canonical: OK? (Recommended. It matches everything live and Search Console.)
2. Un-ignore and commit `CLAUDE.md`? It's ignored today, which looks accidental given its preamble.
3. Studio: confirm `apps/studio` + `sanity deploy` at `badger3000.sanity.studio`, with `/studio` on the new site becoming a redirect.
4. Can PR #215 be merged to `master` now? B1 should start after it.
5. Workers Builds (recommended) or a GitHub Action with a `CLOUDFLARE_API_TOKEN` secret for the `apps/web` deploy?
6. Is there a Sanity read token separate from the write token, so the Worker's runtime token (for `/api/chat`) can be read-only?
