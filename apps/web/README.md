# apps/web — the Astro front end

The badger3000 frontend, rebuilt on Astro (ADR 0006) and deployed to Cloudflare
Workers. This is PRD phase 1 of [`astro-conversion`](../../docs/prd/astro-conversion.md):
**foundation only** — tokens, the document shell, the agent home screen, and a
working Cloudflare deploy. The Next.js app at the repo root still serves the live
site until the cutover (phase 7).

## Commands

```bash
npm run dev           # astro dev (localhost:4321)
npm run build         # static build into dist/
npm run check         # astro check (TypeScript over .astro files)
npm run sanity:check  # parse every GROQ projection, then fetch if configured
npm run preview       # serve dist/ locally
npm run deploy        # build + wrangler deploy
npm run deploy:dry    # build + wrangler deploy --dry-run (validates config offline)
npm run cf:dev        # wrangler dev (serves the deployed worker's assets locally)
```

Node **24** (matches the repo `.nvmrc`; Astro 7 requires >= 22.23.4). Every script above runs through `scripts/node-guard.mjs`, which picks a supported Node itself — `npm run build` works even when `node` is v22.23.0. Run `nvm use` only for bare commands such as `npx astro …`.

## Deploying

The site is a Workers **Static Assets** worker (`wrangler.jsonc`) — no Worker
script yet. Authenticate once with `npx wrangler login`, then `npm run deploy`.

To turn on server rendering for `/api/chat` (PRD phase 4) follow the comment at
the top of `astro.config.mjs`: add `@astrojs/cloudflare` and let the adapter own
`main` + `assets`. Pages that stay static keep shipping as assets.

## Layout

```
src/
  layouts/Base.astro      <head>, tokens, pre-paint theme restore
  components/             pen component masters, one file each
    Icon.astro            lucide renderer for the pen's `icon` nodes
    ThemeToggle.astro     light -> dark -> forest island (vanilla JS)
    Button.astro          pen master CTvHL
  lib/sanity/             the content layer
    client.ts             @sanity/client + env, draft-aware
    queries.ts            one GROQ projection per browse view
    types.ts              shapes, mirroring schemas/parts/*.js
  pages/                  routes (home + 404 today)
  styles/tokens.css       pen "Design Tokens" board: --p-* -> --a-*, 3 skins
scripts/
  node-guard.mjs          re-runs npm scripts on a Node Astro accepts
  sanity-check.ts         parses and runs the GROQ projections
public/
  _headers                cache + security headers honoured by Cloudflare
.env.example              PUBLIC_SANITY_* names (see ADR 0010)
```

## Content

`src/lib/sanity` is the only place that knows about Sanity. `queries.ts` holds one
projection per browse screen in the pen, with aliases that make the pen's
`← field` bindings literally true (`web_url` → `webUrl`), and references
dereferenced in GROQ rather than in components.

```bash
cp .env.example .env      # fill in PUBLIC_SANITY_PROJECT_ID
npm run sanity:check      # 11 queries parse, then counts per content type
npm run sanity:check -- --parse   # syntax only, no network
```

Field names come from `schemas/parts/*.js` at the repo root. **Where the pen and
the schema disagree, the schema wins** and the `.pen` binding gets corrected —
currently `ProjectCard` claims `project.excerpt`, which no `projects` field
provides.

## Rules

- **Design is the source of truth.** Geometry, fills, and `context` strings come
  from [`design/badger3000v2.pen`](../../design/badger3000v2.pen). Change the pen
  first, then port it — see [`designing-from-the-pen`](../../docs/runbooks/designing-from-the-pen.md).
- **Tokens only.** Components read `var(--a-*)`; never hardcode a color. A new
  skin is one more `[data-theme]` block in `tokens.css`.
- **No React yet.** Islands stay vanilla until a component genuinely needs a
  framework.

## Not built yet (by PRD phase)

| phase | adds |
| --- | --- |
| 2 | the remaining 19 component masters + mobile drawer/tab bar |
| 3 | Sanity client/GROQ + `/`, `/articles`, `/codepen`, `/experience`, `/bookmarks`, browse grids |
| 4 | `/api/chat` intent router + retrieval + the conversation UI |
| 5 | Cloudflare adapter, sitemap/RSS, contact endpoint, Sanity Studio |
| 6 | Turborepo monorepo ([runbook](../../docs/runbooks/turborepo-migration.md)) |
| 7 | cutover: this app replaces the Next app at the root |