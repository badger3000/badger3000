# B0 lane: client

Read `docs/review/2026-10-22/briefs/b0-_common.md` first. Reports: `runtime-a11y-seo.md` (findings 1–6, 13, 14, 16, and Proposal §1), `design.md` (finding 1).

- Worktree: `/Users/badger3g/Code/badger3000-wt/b0-client`, branch `fix/b0-client`
- Dev port: **4332**
- Signal: `b0-client`

## Your files

`apps/web/src/lib/chat.ts`, `apps/web/src/lib/browse.ts`, `apps/web/src/lib/theme.ts`, new `apps/web/src/lib/island.ts` and `apps/web/src/lib/shell.ts`, `apps/web/src/components/*.astro` (scripts and markup only, no visual redesign), `apps/web/src/layouts/*.astro`, `apps/web/src/pages/index.astro`, `apps/web/src/pages/projects.astro`. **Not** `src/pages/api/**`, `src/lib/sanity/**`, `src/lib/agent/**` (server lane). You may `import type` from `lib/agent/retrieve.ts`, but don't edit it.

## Tasks, in order

1. **Lifecycle helper.**
   - Add `src/lib/island.ts` (`island(selector, setup)` with a per-root `data-bound` guard and cleanup on `astro:before-swap`; `delegate(type, selector, fn)` bound once per document). Use runtime §1 as the starting sketch.
   - Add `src/lib/shell.ts` for every document-level delegate (drawer open/close/backdrop, theme options for both the desktop toggle and the drawer segment, `[data-new-chat]`, suggestion chips, search focus, back button). Import it once from `AppShell.astro`. Page-specific code inits only on `astro:page-load`, never also at the top level.
2. **Mobile drawer (P1).** No cached DOM nodes; look things up at event time. Verify at 390 px: `/` → drawer → `/projects` → tab-bar Chat → open the drawer again. It works, the theme segment works, and Profile opens.
3. **Chat thread state (P1).**
   - Hold the thread at module scope with `reset()`. "New conversation" clears it from `/` and from any browse page.
   - Each pending turn has an id and is resolved by that id. Disable Send (`aria-disabled` + ignore submits) while a request is in flight.
   - On restore, a stale `pending` turn becomes a short "That answer was interrupted — ask again." line.
4. **Chat error states.** Check `response.ok`. Render the server's 503 `degraded` text as a normal agent turn. 429 → "You're asking quickly — give it a minute." Network failure → the current message plus a "Try again" button that re-asks. Render `suggestions` as `SuggestionChip`s when present (the template exists). After send, keep focus in the field and scroll only the new agent turn into view (`block: "nearest"`).
5. **Theme flash (P1).** Apply the stored theme to the incoming document on `astro:before-swap` (`e.newDocument.documentElement.dataset.theme`), in `Base.astro`'s inline script. The toggle's page-load code only paints `aria-pressed`. Render `aria-pressed="false"` server-side on every option. The drawer has no Forest option; leave it (owner decision pending), but a forest user must not see a broken state: neither option pressed is acceptable.
6. **Hash scroll (P1).** `AppShell` scroll restore: if `location.hash` targets an element, `scrollIntoView` it and skip the saved position (soft and hard loads). Education gets `aria-current` when the hash is `#education`.
7. **Mobile overflow (P1).** `AppShell.astro` `.shell` at ≤720px: `minmax(0, 1fr)`. Verify `/projects` at 390 px has no horizontal scroll (`document.documentElement.scrollWidth <= 390`).
8. **`browse.ts` and `projects.astro`.** Convert them to `island()`. Fold the duplicated filter logic in `projects.astro` into `browse.ts` if it's a clean move; otherwise just fix its init.
9. **`MobileTabBar`.** Remove `aria-current` from the Profile button (use `aria-haspopup="dialog"`). On `/bookmarks`, Saved is current, not Explore.

Out of scope (later steps): the live-region rewrite, contrast tokens, the focus-visible rule, design-fidelity fixes, SEO.

## Verify

- `npm run check && npm run build` pass.
- In the browser (dev server on 4332; use `cmux browser` in your own pane, and use a fresh `sessionStorage`, since other panes may share the profile):
  - drawer after two soft navigations;
  - New conversation from `/projects`;
  - two rapid sends (both resolve, in order);
  - dark-theme navigation with no light flash (check `data-theme` on `astro:after-swap`);
  - `/experience#education` lands on Education;
  - `/projects` at 390 px has no horizontal overflow;
  - exactly one `/api/chat` request per question.
