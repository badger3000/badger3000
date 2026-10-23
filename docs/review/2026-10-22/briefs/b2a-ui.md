# B2a lane: tokens + ui

Read `docs/review/2026-10-22/briefs/b2-_common.md` first. Report: **`design.md`** (findings 1–26 and Proposal §A, §B). Also `runtime-a11y-seo.md` for the contrast numbers.

- Worktree: `/Users/badger3g/Code/badger3000-wt/b2a-ui`, branch `feat/b2a-ui`
- Dev port: **4341**
- Signal: `b2a-ui`

## Your files

New `packages/tokens/**` and `packages/ui/**`; in `apps/web`: `src/components/**`, `src/layouts/**`, `src/styles/**`, `src/pages/*.astro` (not `src/pages/api/**`), `src/lib/{palette,theme,chat,browse,shell,island}.ts`, new `src/lib/nav.ts`, `astro.config.mjs` (only if Astro needs config to consume `packages/ui`), `apps/web/package.json` dependencies.
**Not:** `src/lib/sanity/**`, `src/lib/agent/**`, `src/pages/api/**`, `scripts/**`, `apps/legacy-next/**`, `packages/sanity/**` (sanity lane).

## Tasks, in order

1. **`packages/tokens`** (§B). `tokens.css` (tier 1 + tier 2 + type + motion + their keyframes) and `base.css` (reset, html/body, `color-scheme` incl. explicit forest, reduced-motion). `apps/web` imports both instead of `src/styles/tokens.css` (delete it). Pixel-identical at this step: verify by screenshot before/after.
2. **New semantic tokens** (§B list) in all three themes, plus the contrast tokens `--a-subtle` and `--a-accent-text` with AA values (≥4.5:1 on their backgrounds; show the ratios you computed in the commit body). Replace the 26 hex literals outside tokens with them. Don't swap `--a-faint` usages to `--a-subtle` yet (B4); only define it.
3. **`covers.ts`**: `lib/palette.ts` → `packages/tokens/src/covers.ts` with `--p-cover-N-from/-to` primitives in `tokens.css`; `gradientFor`/`tintFor` return `var()` strings. Small `tokens.ts` (`themes` const + `--a-*` name union, no values); `lib/theme.ts` and `ThemeToggle` type-check against it.
4. **`packages/ui`**: the presentational masters in §A's table with the API changes in bold, including the new Avatar, AvatarUser, NavItem, FeatureCard (renamed from `ProjectCard.astro`, `f3kriq` metrics, radius 14) and the compact ProjectCard (`FE7oC`). Props are plain values, never Sanity types. Fold in the fidelity fixes (findings 2–11: StatTile icon + stroke, Composer stroke stays in the app, ProjectCard cover via `gradientFor`, IconButton/SuggestionChip/ShieldsBadge strokes and tokens). Check each master against the pen with the pencil MCP before porting. SuggestionChip's document-level click script moves to `apps/web/src/lib/chat.ts` (or `shell.ts`) with **unchanged behaviour** (fill only, no submit: owner question 10). TimelineEntry, TestimonialCard, BookmarkFolder stay in the app. Golf stays at 3 StatTiles (owner question 8).
5. **App wiring.** App shell components stay in `apps/web` and compose `NavItem`/`Avatar`/`AvatarUser` from the package. Nav array once in `src/lib/nav.ts` (Sidebar + MobileDrawer). Replace the six inline 🦡 avatars. Pages import from `@badger3000/ui`; call sites map Sanity rows to plain props with `?? undefined`. Make sure Astro compiles `.astro` files from the workspace package (check the installed Astro docs for linked packages / `vite.ssr.noExternal`).
6. **Mobile PageHeader** (finding 1, second half): at ≤720px hide `.ask` and the inline Input per pen `Fn67n`, if it fits cleanly; otherwise list it.

## Lane-specific checks

- Before you change anything, screenshot `/`, `/projects`, `/golf`, `/skills`, `/experience`, `/bookmarks` at 1440×900 and 390×844 in light, dark and forest on your dev server (`cmux browser` in your own pane, fresh `sessionStorage`). After the work, retake them. Differences must be only the intended fixes (strokes, StatTile icon, per-card covers, FeatureCard metrics); list each one. Keep the screenshots in your scratch dir, not in the repo.
- `rg -n '#[0-9a-fA-F]{3,8}\b' apps/web/src packages/ui` finds no colour literals outside `packages/tokens` (comments excepted).
- `/projects` at 390 px: `document.documentElement.scrollWidth <= 390`.
- Mobile drawer still works after two soft navigations; theme toggle works in all three themes.
