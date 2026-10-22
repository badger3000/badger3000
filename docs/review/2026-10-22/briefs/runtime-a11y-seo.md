# Lane: runtime-a11y-seo

Read `docs/review/2026-10-22/briefs/_common.md` first. Lane name for the report and signal: `runtime-a11y-seo`.

## Scope

1. **Island lifecycle.** Every `<script>` in `apps/web/src/**/*.astro` and `src/lib/{chat,browse,theme}.ts`: how it initialises (top-level, `astro:page-load`, both), whether it holds stale DOM references across `<ClientRouter />` navigations (chrome is re-rendered, not persisted), listener leaks, double binding. Verify seed #2 and #3 in the browser: ask one question on `/` and count `/api/chat` requests (`cmux browser` network/console, or add nothing — observe only); navigate twice then try the mobile drawer at 390px width.
2. **Chat UX.** Thread restore from `sessionStorage`, "New conversation", pending state, error state when `/api/chat` fails, focus management after send, live-region behaviour (nested `aria-live`, full repaint per turn in `chat.ts:166`).
3. **Accessibility.** Landmarks per the pen `context` (main/aside/nav/section), headings order per route, focus visibility, keyboard paths (sidebar, filters, drawer `<dialog>`, theme toggle `aria-pressed`, forest option missing in drawer), `aria-current` usage, `target="_blank"` cues, colour contrast for all three themes (compute from `tokens.css`), reduced motion.
4. **SEO/meta.** `layouts/Base.astro` + `Browse.astro`: title/description per route, canonical (apex vs www), OG/Twitter tags, `og:image`, manifest/icons, `robots.txt` (points at a missing sitemap), structured data (Person / Article), 404 handling. Compare to what the Next app emits (`app/layout.tsx`, `app/articles/[slug]/page.tsx` `generateMetadata`).
5. **Performance.** Build output size if `apps/web/dist` exists (don't rebuild into the repo), font loading (`Base.astro` Google Fonts), images (Sanity image URLs without sizing), `public/_headers` cache policy, view-transition cost, JS shipped per page.

## Proposal must include

- A single island-lifecycle pattern for the codebase (init exactly once per page-load, idempotent, cleanup) with a code sketch, and the list of files to convert.
- An SEO/meta component spec (props, defaults, per-route overrides, article variant) for `Base.astro`.
- Prioritised a11y fixes.
