# apps/web — the Astro front end

The badger3000 frontend, rebuilt on Astro (ADR 0006) and deployed to Cloudflare
Workers. It's `@badger3000/web` in the pnpm + Turborepo workspace
([`astro-conversion`](../../docs/prd/astro-conversion.md), ADR 0007). The browse
routes, the agent chat and the Cloudflare adapter are in; detail pages, feeds and
SEO are next. The Next.js app in `apps/legacy-next` still serves the live site
until the cutover (phase 7).

## Commands

Install once from the repo root (`pnpm install`; one `pnpm-lock.yaml` for the
workspace). Then, inside `apps/web`, or from the root as
`pnpm --filter @badger3000/web run <script>`:

```bash
pnpm run dev           # astro dev (localhost:4321)
pnpm run build         # static build into dist/
pnpm run check         # astro check (TypeScript over .astro files)
pnpm run sanity:check  # parse every GROQ projection, then fetch if configured
pnpm run preview       # serve dist/ locally
pnpm run deploy        # build + wrangler deploy
pnpm run deploy:dry    # build + wrangler deploy --dry-run (validates config offline)
pnpm run cf:dev        # wrangler dev (the Worker, including /api/chat)
```

From the root, `SANITY_ALLOW_EMPTY=1 pnpm turbo run check build --filter=@badger3000/web`
is what CI runs (cached, no credentials).

Node **24** (matches the repo `.nvmrc`; Astro 7 requires >= 22.23.4). Every script above runs through `scripts/node-guard.mjs`, which picks a supported Node itself, so `pnpm run build` works even when `node` is v22.23.0. Run `nvm use` only for bare commands such as `pnpm exec astro …`.

## Deploying

Static-first on a Worker (ADR 0009): `@astrojs/cloudflare` owns `main` and
`assets` in `wrangler.jsonc`. Every page is prerendered and ships as assets; only
`src/pages/api/chat.ts` (`prerender = false`) runs in the Worker. Authenticate once
with `pnpm exec wrangler login`, then `pnpm run deploy`. Full steps, including the
Workers Builds settings, are in
[`deploy-astro-to-cloudflare`](../../docs/runbooks/deploy-astro-to-cloudflare.md).

## Layout

```
src/
  layouts/Base.astro      <head>, tokens, pre-paint theme restore, <ClientRouter />
  components/             pen component masters + AppShell chrome, one file each
  lib/sanity/             the content layer
    client.ts             @sanity/client + env, draft preview opt-in
    queries.ts            one GROQ projection per browse view
    types.ts              shapes, mirroring apps/legacy-next/schemas/parts/*.js
  lib/agent/              /api/chat: intents -> retrieve -> compose (ADR 0008)
  lib/chat.ts             the chat island (vanilla, clones <template data-chat-*>)
  lib/island.ts, shell.ts island lifecycle helpers, document-level delegates
  pages/                  home (agent), browse routes, 404, api/chat.ts
  styles/tokens.css       pen "Design Tokens" board: --p-* -> --a-*, 3 skins
scripts/
  node-guard.mjs          re-runs package scripts on a Node Astro accepts
  sanity-check.ts         parses and runs the GROQ projections
  verify-dist.mjs         postbuild: fails if SANITY_API_TOKEN reaches dist/
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
pnpm run sanity:check     # every query parses, then counts per content type
pnpm run sanity:check -- --parse  # syntax only, no network
```

Field names come from `apps/legacy-next/schemas/parts/*.js` (moving to
`packages/sanity` in B2). **Where the pen and the schema disagree, the schema
wins** and the `.pen` binding gets corrected. Currently `ProjectCard` claims
`project.excerpt`, which no `projects` field provides; `queries.ts` derives it
from the first description block until the content model decides.

## Navigation

`<ClientRouter />` in `Base.astro` makes navigation client-side: the URL and
history update, but there is no full page load. Two rules keep that invisible:

- **The chrome never animates.** `AppShell`'s scroll area is the only element
  with `transition:name="content"`, and `Base` sets
  `::view-transition-old/new(root) { animation: none }`, so only that group
  cross-fades.
- **The chrome is replaced, not persisted.** `transition:persist` would freeze
  the sidebar's `aria-current` on whichever page first rendered it. Re-rendering
  costs nothing visible, and every component re-initialises on `astro:page-load`.

`.shell` is exactly one viewport tall with `overflow: hidden`: the sidebar and
topbar are fixed and `.body` is the only scroll container. Scroll positions are
kept per URL in `sessionStorage` so back/forward returns where you were —
Astro's own restore only knows about `window.scrollY`.

## Rules

- **Design is the source of truth.** Geometry, fills, and `context` strings come
  from [`design/badger3000v2.pen`](../../design/badger3000v2.pen). Change the pen
  first, then port it — see [`designing-from-the-pen`](../../docs/runbooks/designing-from-the-pen.md).
- **Tokens only.** Components read `var(--a-*)`; never hardcode a color. A new
  skin is one more `[data-theme]` block in `tokens.css`.
- **No React yet.** Islands stay vanilla until a component genuinely needs a
  framework.

## Not built yet

| step | adds |
| --- | --- |
| B2 | `packages/tokens`, `packages/ui`, `packages/sanity` (schemas, typed queries), `apps/studio` |
| B3 | `articles/[slug]`, `codepen/[slug]`, RSS + `/api/articles-feed`, sitemap, `<Seo>`, `/api/contact`, agent quality |
| B4 | accessibility and pen-fidelity polish |
| 7 | cutover: this app replaces `apps/legacy-next` on `www.badger3000.com` |

The backlog with details is in
[`docs/review/2026-10-22/README.md`](../../docs/review/2026-10-22/README.md).
