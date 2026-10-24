# B4a lane: accessibility and polish

Read `b2-_common.md` and `b3-_common.md` first: their rules, setup, Done-means checks, final-message sections and signal all apply. Report: **`runtime-a11y-seo.md`**. B0 to B3 already fixed findings 1–6, 10–14, 18, 25 and 27. This lane takes the rest that need no owner decision.

- Worktree: `/Users/badger3g/Code/badger3000-wt/b4a-a11y`, branch `feat/b4a-a11y`
- Dev port: **4361**
- Signal: `b4a-a11y`

## Your files

`apps/web/src/**`, `packages/ui/**`, `packages/tokens/**` (only to apply existing tokens, not to change their values). **Not:** `design/**` (B4b edits the pen at the same time), `lib/agent/**`, `pages/api/**`, `packages/sanity/**`. Add no dependencies.

## Tasks, in order

1. **Contrast** (findings 8, 9):
   - Every **text** use of `--a-faint` becomes `--a-subtle`; decorative uses (rules, dots) stay.
   - Accent text on light or soft backgrounds uses `--a-accent-text`.
   - White on coral uses `--a-on-accent` only where it reaches 4.5:1 (or 3:1 for large text). Otherwise use `--a-accent-text`.
   - Verify with a contrast script over the three themes and list the ratios.
2. **Focus** (finding 20): one shared `:focus-visible` ring from tokens, in `base.css` or a single place. Remove `outline: none` where nothing replaces it. Every interactive element in the app shell, cards and chat shows it.
3. **Chat live region** (findings 7, 16):
   - Announce only the new agent turn, not the whole thread: move `aria-live` to a dedicated status element, or append without repainting.
   - After Send, focus returns to the input.
   - The new turn scrolls into view with `block: "nearest"`.
4. **External links** (finding 21): every `target="_blank"` gets `rel="noopener noreferrer"` plus a visible icon cue and a visually hidden "(opens in a new tab)". Use one helper or component and reuse it.
5. **Headings and landmarks** (findings 19, 22):
   - Card titles become headings in a correct outline: `h1` page, `h2` sections, `h3` cards.
   - The topic filter `nav` becomes a labelled group instead of a landmark.
   - Check each route with a quick outline script.
6. **404** (finding 23): render it inside `AppShell` (nav and theme toggle). Keep `noindex`.
7. **Bookmarks weight** (finding 24), with no owner decision needed:
   - Keep every bookmark on one page.
   - Folders after the first render collapsed in `<details>`, and their rows render lazily, e.g. `content-visibility: auto`.
   - Measure the HTML size and transfer time before and after.
   - Pagination stays an owner question.
8. **Images** (finding 26): Sanity images in TimelineEntry and TestimonialCard use `imageUrl` sized for their slot (with `srcset`), plus `width` and `height` attributes.
9. **Back button** (finding 28): "Go back" uses `history.back()` only when the referrer is same-origin. Otherwise it goes to `/`.

Leave these, because the owner hasn't decided (Q12, Q13, Q14): Forest on mobile, the no-JS chat form (finding 15), bookmark pagination, and the avatar link (29). List them.

## Lane-specific checks

- An axe-style pass in the cmux browser (inject axe-core from `cdn.jsdelivr.net` into your own dev page only) on `/`, `/projects`, `/articles/<one>`, `/codepen/<one>`, `/bookmarks`, `/experience` and `/404`, in light and dark. Zero serious or critical issues; list anything left.
- Keyboard: Tab through `/` and `/projects`. Focus is visible on every stop and the order is logical; the drawer traps and restores focus at 390px.
- The contrast ratio table for each changed pairing, in all three themes.
- Screenshots before and after (1440 and 390, light and dark) of `/`, `/projects`, `/bookmarks`. The only differences are the intended ones.
