# badger3000 deep review — 2026-10-22

Four parallel review lanes (cmux workspace `b3k-review`) over the Next → Astro + Sanity migration and the planned pnpm + Turborepo monorepo. Lane reports, with every finding's file:line and fix:

- [design.md](./design.md) — pen ↔ components, tokens, detail-view spec, `packages/ui` + `packages/tokens` proposal
- [content-agent.md](./content-agent.md) — Sanity schema/types/queries, secrets, `/api/chat` pipeline, `packages/sanity` + `apps/studio` proposal
- [runtime-a11y-seo.md](./runtime-a11y-seo.md) — island lifecycle, chat UX, accessibility, SEO, performance
- [platform.md](./platform.md) — monorepo layout, `apps/legacy-next` move, Netlify, CI, scripts, parity endpoints, **step-by-step B1 runbook**

Briefs the lanes worked from are in [briefs/](./briefs/).

## Headline

The Astro app is a credible base: the semantic tokens match the pen 1:1 in all three skins, JS per page is small, reduced motion is handled, and the agent works on the happy path. But it is **not shippable yet**. It has one live secret leak, mobile navigation breaks after a single click, and every article link is a 404. It also lacks the SEO, feed and sitemap pieces the live Next site has. The monorepo move itself is mechanical, *if* four traps are handled first (credential-less build, Turbo caching vs Sanity content, the README workflow, crashing root scripts).

## P0 — act now (owner)

| # | what | where | action |
|---|---|---|---|
| 1 | **Sanity token compiled into the Worker bundle** and copied into `dist/server/.dev.vars` | `apps/web/src/lib/sanity/client.ts:15-26` (`import.meta.env`) | **Rotate the token.** Then fix the code: read via `astro:env/server` (secret, runtime), set with `wrangler secret put`, use a *Viewer* token, add a CI grep guard. Check `wrangler deployments list` for anything already uploaded. |
| 2 | **Contact-form fix PR #215 is merged nowhere**: production's contact form is still broken (incident 2026-10-11) | branch `fix/contact-form-resend` | Merge #215 into `master`, then `master` into `astro-dev`, **before** the skeleton move (otherwise `git mv` conflicts). |

## P1 — broken or wrong for users (fix in Phase B)

**Runtime / chat**
- Mobile drawer dies after any client-side navigation (`InvalidStateError`), so mobile nav, the theme buttons and the Profile tab all stop working. `MobileDrawer.astro:333,348`
- "New conversation" resurrects the old thread on `/` (`chat.ts:114,249`), and does nothing when started from a browse page (`chat.ts:255-276`, only `/` imports it).
- Two quick sends leave an answer **pending forever**, and the first answer lands under the second question (`chat.ts:204-240`).
- Dark/forest users see a light-skin flash on every navigation (`ThemeToggle.astro:95-115`, `Base.astro:28`).
- `/experience#education` never reaches its anchor (`AppShell.astro:157-166`).
- Mobile `/projects` overflows horizontally: `AppShell.astro:121` `1fr` → `minmax(0,1fr)`.
- Seed correction: chat does **not** double-POST. It double-*binds* on first load (`chat.ts:278`). That's harmless today, but it's the root of the fragile thread state.

**Agent (`/api/chat`)**
- Any Sanity error → non-JSON 500, and the UI says "couldn't reach the agent" (`api/chat.ts:70`, `lib/chat.ts:213`).
- Retrieval ignores the visitor's words: "react bookmarks" returns the first 8 of 888 bookmarks alphabetically (`retrieve.ts:141-276`).
- Intent regexes match word prefixes: "ready" routes to articles, "pending" to experiments (`intents.ts:39-70`).
- The reply count disagrees with the cards ("8 roles", 1 card) (`api/chat.ts:72-76`).
- No rate limit or body-size cap. Every POST makes 1–3 uncached Sanity reads (`useCdn:false`, but the CDN *does* work with the token).

**Routes / SEO / parity**
- No `articles/[slug]` or `codepen/[slug]`: every article link 404s, and so will the README feed links after cutover. A build-ready spec is in design.md §D.
- No `og:image`, manifest, icons, JSON-LD, RSS alternate or sitemap (robots.txt advertises a missing one). The 404 page is indexable with canonical `/404/`.
- **Host mismatch**: Astro uses the apex domain with trailing-slash canonicals; Next, Search Console, the redirects and the README script use `www` with no slash.
- No RSS. `/api/articles-feed` must keep working for `scripts/update-readme.js`.

**Accessibility**
- `--a-faint` text fails AA in all three themes (2.3–3.6:1); the light accent fails as small text and as white-on-coral. Pen first, then new `--a-subtle` and `--a-accent-text` tokens.
- The chat live region re-announces the whole thread every turn (`index.astro:38` + full repaint in `chat.ts:166`).

**Design fidelity**
- 4 of 21 pen masters have no component (Avatar ×6 inline copies, AvatarUser, NavItem ×2 copies, FeatureCard). `ProjectCard.astro` is actually FeatureCard with ProjectCard metrics.
- Pen strokes dropped (Composer, StatTile, IconButton, SuggestionChip, ShieldsBadge). StatTile icon is centred instead of top-left. All 9 project covers share one hardcoded gradient. 26 hex literals sit outside tokens.

**Platform**
- **Neither app builds without Sanity credentials**, which contradicts the docs and blocks a secret-free CI.
- Turbo cache + build-time Sanity fetch means a webhook rebuild would redeploy yesterday's `dist/`. Deploy hosts must call package scripts, not `turbo run`.
- The README workflow breaks after B1 (`cache: npm`, `NEXT_PUBLIC_SITE_URL` only, `http.get` doesn't follow redirects).
- 11 of 21 root scripts already crash (CJS under `"type":"module"`), including the two `CLAUDE.md` tells you to run.

## P2/P3 themes (details in lane reports)

- Schema drift: `topics.backgroundColor` is a string in the schema but a colour object in the data; dates are free-text sorted as strings; types are non-null where the schema allows empty. 10 projections are duplicated between `queries.ts` and `retrieve.ts`. **Adopt `sanity typegen`** (half a day).
- The grounding check in `compose.ts` passes invented numbers and substrings, and its allow-list contains praise words. The facts invent "worked with him at". The timeout leaks (`Promise.race`).
- Islands: one `island()`/`delegate()` lifecycle helper plus a `shell.ts` for document-level delegates (runtime §1).
- Focus-visible missing on most links; `target=_blank` without a cue; card titles aren't headings; filter `nav` is a fake landmark.
- Performance: render-blocking Google Fonts, and Geist Mono is never loaded (all mono text is off-pen). The bookmarks page is 774 KB of HTML. Sanity images are served unsized.
- Headers: no CSP or HSTS; API responses get none of the `_headers` policy.
- Stale docs: ADR 0006/0007/0009/0010, three runbooks, `apps/web/README.md`, `CLAUDE.md` (which is also **git-ignored**, `.gitignore:34`).

## Decisions needed from you

Blocking Phase B (B0–B1). Items 2–6 were decided on 2026-10-22:
1. **Rotate the Sanity token**, and confirm a read-only token is available for the Worker. *(Open; this is owner action.)*
2. ✅ PR #215: **the owner merges it into `master`**; then `master` is merged into `astro-dev` before B1.
3. ✅ Canonical host: **`https://www.badger3000.com`, no trailing slash**. The apex 301s to it at cutover.
4. ✅ **Un-ignore and commit `CLAUDE.md`** (in B1.8).
5. ✅ Cloudflare deploy: **Workers Builds**.
6. ✅ Studio: **`apps/studio` + `sanity deploy` → `badger3000.sanity.studio`**, with `/studio` redirecting.

Needed before B3 (content model / UX):
7. Projects: add real `excerpt` + `year` fields, or keep deriving them from `project_description[0]` / `_createdAt`?
8. Golf: what's the 4th stat? Add `par`, or remove the diff column from the pen?
9. `blockContent`: add a `code` block type for the article code block?
10. Suggestion chips: submit immediately, or only fill the composer?
11. Detail hero uses `main_image` while cards stay gradient, or cards switch to images too?
12. Forest skin on mobile (add it to the drawer), or desktop-only?
13. Chat without JS: server-rendered `/ask` page, or require JS and drop the form `action`?
14. Bookmarks: keep ~880 on one page, or collapse/paginate? Open them in new tabs?
15. Bio doc: is `settings` the ADR 0008 persona doc? May it gain `email`?
16. Migrate experience/education dates to `date` fields?
17. `astro dev` showing drafts by default, or only behind `SANITY_PREVIEW=drafts`?

## Phase B backlog (refined)

Each build lane runs on its own branch and worktree off `astro-dev`, one cmux pane each. I merge in order and run the checks after every merge.

| step | lane | contents | runs |
|---|---|---|---|
| **B0** ✅ merged 2026-10-22 (`6421c9a`, `e677f53`) | fix-first | token via `astro:env/server` + CI grep guard; `/api/chat` try/catch + 503 JSON + `coalesce`; body cap / type check / 405; rate-limit binding; drawer + shell lifecycle (`island`/`delegate`, `shell.ts`); chat thread state (reset, pending by id, `response.ok`); theme `before-swap`; `minmax(0,1fr)`; `SANITY_ALLOW_EMPTY` guard for credential-less builds | serial, first |
| **B1** | skeleton | add `@types/node` as an `apps/web` devDependency (a bare worktree or isolated pnpm install has none, and `astro check` then reports 11 `process` errors); platform.md §B1.0–B1.8 verbatim: dead files out, `git mv` → `apps/legacy-next`, pnpm workspace + `approve-builds`, `packages/config` + `packages/sanity` skeleton, turbo, root `netlify.toml` with `base`, `ci.yml`, README workflow fix, docs | serial, after B0 + #215 |
| **B2a** | tokens+ui | `packages/tokens` (tokens / base split, new semantic tokens incl. contrast fixes, `covers.ts` from `palette.ts`, small TS map); `packages/ui` (presentational masters incl. new Avatar, AvatarUser, NavItem, FeatureCard rename + compact ProjectCard; stroke/geometry fixes); app shell stays in `apps/web`; `lib/nav.ts` | parallel |
| **B2b** | sanity+studio | `packages/sanity` (`./schema`, runtime `createSanity`, named `defineQuery` queries incl. hoisted `retrieve.ts` ones, typegen, `useCdn:true` + per-isolate memo); `apps/studio` (`sanity deploy`); Topics colour schema fix | parallel |
| **B3a** | detail pages | `articles/[slug]`, `codepen/[slug]` per design.md §D; Portable Text (Shiki, embeds); related rows; `<Seo>` article variant | parallel, after B2 |
| **B3b** | platform endpoints | `<Seo>` component + `public/` assets; RSS (`/rss.xml` + `/api/articles-feed`); `@astrojs/sitemap` + robots + `_redirects`; `/api/contact` (PR #215 logic, fetch to Resend, secrets via `astro:env/server`); `jsonResponse()` security headers; self-hosted fonts | parallel, after B2 |
| **B3c** | agent quality | intents scoring + `\b`; retrieval with `$q`; counts after filtering; grounding check rewrite + fixtures (`agent:check`); timeout abort | parallel, after B2b |
| **B4** | a11y + polish | contrast tokens applied, focus-visible, live region, headings, external-link cues, landmarks, bookmarks pagination; pen corrections P-1…P-9 (via pencil MCP, with your OK) | after B3 |
| **B5** | docs | ADR amendments (0006/0007/0009/0010) + new ADRs (legacy-next move, www canonical, Studio hosting, Workers Builds); runbooks; `CLAUDE.md` | last |
