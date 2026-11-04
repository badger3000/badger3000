# runtime-a11y-seo review

## Summary (5 lines max)
Seed #3 is confirmed in the browser: after any client-side navigation the drawer throws `InvalidStateError: Element is not connected`, so mobile nav and the drawer's theme buttons stop working. Seed #2 is double-binding, not double-submit: the first listener clears the field, so the second sends nothing. Exactly one `/api/chat` request was observed per question.
Chat bugs found in the browser that are worse than the seed: "New conversation" brings the old thread back on the next question, two quick sends leave an answer stuck pending forever, and from a browse page "New conversation" never clears at all.
Dark and forest users get light-theme content during every navigation transition (verified: `after-swap:light → page-load:dark`). `/experience#education` never scrolls to its anchor.
SEO is bare. There is no `og:image`, manifest, apple-touch icon, JSON-LD, sitemap (robots.txt points at one) or article variant. Canonicals use the apex domain with a trailing slash, while every internal link has no slash, and `404.html` declares a canonical of `/404/`.
`--a-faint` fails AA contrast in all three themes (2.3–3.6:1). It is used for counts, footer links, placeholders, tab labels and status text.

## Findings
| # | sev | where (file:line or pen id) | problem | fix | effort |
|---|-----|-----------------------------|---------|-----|--------|
| 1 | P1 | `src/components/MobileDrawer.astro:333,348` | Seed #3 verified at 390px: `/` → drawer link to `/projects` → tab bar "Chat" → hamburger throws `InvalidStateError: Element is not connected`. `drawer` and `segment` are captured once at module load, so after a swap `showModal()` runs on the detached old dialog. The backdrop-close check (`target === drawer`) and the Appearance segment are dead too, and so is the "Profile" tab (`MobileTabBar.astro:47`) on every browse page reached by soft nav. | Look the elements up at event time: `const drawer = () => document.querySelector("[data-drawer]")`. Keep one document-level click delegate (already the case) and move the segment click into it (`target.closest("[data-theme-segment] [data-theme-option]")`). See Proposal §1. | S |
| 2 | P1 | `src/lib/chat.ts:114,249,257-276` | "New conversation" on `/` resurrects the old thread. The in-place handler clears storage and DOM but not the `turns` array closed over by `init()`. Verified: clear → ask → log shows all 8 old + new turns, and storage gets them back. | Hold thread state at module scope (`let thread: Turn[]`) with a `reset()` that the click handler calls, or have the handler dispatch `badger:chat-reset`, which the live init listens for and answers with `turns = []; painted = 0; paint()`. | S |
| 3 | P1 | `src/lib/chat.ts:255-276` + `src/pages/index.astro:205` | "New conversation" from a browse page does nothing on a session that started on a browse page. The click handler that calls `armClear()` lives in `chat.ts`, which only `/` imports. Verified: hard-load `/projects` → sidebar "New conversation" → `/` shows the old thread. | Move the `[data-new-chat]` delegate into a module that every page loads (e.g. `src/lib/shell.ts`, imported from `AppShell.astro`). Keep `consumeClear()` in chat init. | S |
| 4 | P1 | `src/lib/chat.ts:204-240` | Concurrent sends corrupt the thread. Each `ask()` writes its answer into "the last turn", so two quick submits leave the first agent turn `pending: true` forever (persisted, restored as endless dots) and put the first answer under the second question. Verified with two `requestSubmit()`s. The Send button is never disabled. | Give each pending turn an `id` and resolve by id, not by `turns[turns.length-1]`. Set `form.inert`/`aria-disabled` on Send while a request is in flight. On restore, convert stale `pending` turns to an "interrupted, ask again" line. | S |
| 5 | P1 | `src/components/ThemeToggle.astro:95-115`, `src/layouts/Base.astro:28` | Every navigation flashes the light skin for dark and forest users. `swapRootAttributes` copies `data-theme="light"` from the new document, and the toggle only fixes it on `astro:page-load`, which fires after the view-transition update has been captured. Verified: `after-swap:light`, `page-load:dark`. | In Base's inline script, also add `document.addEventListener("astro:before-swap", e => e.newDocument.documentElement.dataset.theme = current)` (or set it on `astro:after-swap`), so the new snapshot is already themed. Keep the toggle's page-load handler only for `aria-pressed`. | S |
| 6 | P1 | `src/layouts/AppShell.astro:157-166`; `Sidebar.astro:24`, `MobileDrawer.astro:32` | The "Education" nav item (`/experience#education`) never reaches its anchor. `restore()` on page-load forces `.body.scrollTop` to the saved value or 0, overriding the hash scroll. On a hard load nothing scrolls `.body` to the hash either. Verified: `scrollTop=0`, `#education` at y=3557 in both cases. "Education" is also never `aria-current`. | In `restore()`, if `location.hash` matches an element, `scrollIntoView()` it and skip the saved position. Mark Education active when `active==="experience" && hash==="#education"` (client-side), or give Education its own route. | S |
| 7 | P1 | `src/pages/index.astro:38`, `src/lib/chat.ts:164-202,186` | Live region repaints the whole thread. `aria-live="polite"` sits on `[data-chat-log]`, and `paint()` does `log.replaceChildren()` and re-adds every turn, so screen readers re-announce the whole conversation (or nothing, in Safari) on every turn. The pending dots add a nested `aria-live` inside it, and the "thinking" `aria-label` is on a `span` with no role (not announced). | `role="log"` on the thread, `aria-live` only there, `aria-relevant="additions"`. Append new turns, and update the pending turn in place (fill the line, drop `data-pending`, remove `aria-busy`). Make the typing span `role="status"` text ("Badger3000 is thinking…", visually hidden) outside the log, or drop it. | M |
| 8 | P1 | `src/styles/tokens.css:47,117,131` | `--a-faint` is used as text colour on `bg`/`surface`/`sidebar`: light 2.59–2.88:1, dark 3.28–3.63:1, forest 2.34–2.72:1, all under AA 4.5:1. Affected: sidebar counts and "EXPLORE" label, TopBar status, footer links (`Footer.astro:77`), placeholders, inactive tab labels (`MobileTabBar.astro:79`), card meta. | Change the pen first, then add a `--a-subtle` text token at ≥4.5:1 (light ≈ `#767268`, dark ≈ `#8a877e`, forest ≈ `#6b7a72`; verify), and keep `--a-faint` for icons and decoration only. | M |
| 9 | P1 | `tokens.css:50-52` (light), all accent-on-`accent-soft` uses | Light coral `#e4572e` is 3.68:1 on white and 3.22:1 on `accent-soft`. White on coral is 3.68:1 (skip link `Base.astro:79`, accent buttons). Small accent text (AskBadger 13px, `.chat-tag` 10.5px, CountBadge, active tab label) fails AA. Forest accent on soft is 4.38:1, which also fails. Dark passes except accent on soft (3.93). | Pen first: add `--a-accent-text` (light ≈ `--p-coral-700` `#c0461f`, 5.0:1 on white), use it for text, and keep `--a-accent` for fills and icons. Put white text only on `--p-coral-700`. | M |
| 10 | P1 | `src/layouts/Base.astro:34,42`; `dist/client/404.html` | Canonicals are `https://badger3000.com/projects/` (apex, trailing slash), but internal links, the Next app and the live site are `www` with no slash. The 404 page emits `canonical=/404/` and `og:url=/404/`, and is indexable. | Spec in Proposal §2: build canonicals from a single `SITE_URL` constant with no trailing slash (pick www or apex once, which is an owner question), and pass `noindex` with no canonical on 404. | S |
| 11 | P1 | `src/layouts/Base.astro:39-43` | No `og:image`/`twitter:image` while `twitter:card=summary_large_image`. No `og:site_name`, `og:locale`, `twitter:title/description`, manifest, `apple-touch-icon`, `theme-color`, RSS `<link rel=alternate>`. The Next app ships all of these (`app/layout.tsx:51-127`: manifest, icons 192/512/apple, `/images/header-image-06.webp`, RSS alternate). | `<Seo>` component (Proposal §2). Port `public/manifest.json`, `public/icons/*` and `favicon.ico` from the Next `public/`, and add a default OG image at 1200×630. | M |
| 12 | P1 | `public/robots.txt:5` | `Sitemap: https://badger3000.com/sitemap-index.xml` doesn't exist (no `@astrojs/sitemap`), and it's apex, not www. | Add `@astrojs/sitemap` with the same `site`, filter `/404`, and serve robots from an endpoint that reads `site`, so the host can't drift. Overlaps seed #6. | S |
| 13 | P2 | `src/lib/chat.ts:278-279`, `src/lib/browse.ts:50-51`, `ThemeToggle.astro:114-115`, `pages/projects.astro:270-271` | Seed #2, corrected. The router dispatches the first `astro:page-load` on `window.load` (`node_modules/astro/dist/transitions/router.js:492`), after module scripts run, so `init()` binds twice on first execution. In chat this does not double-POST: listener 1 clears the field before listener 2 reads it (one `/api/chat` entry in Resource Timing, verified twice, hard and soft load). It still leaves two closures, each with its own `turns`, which is why #2 is fragile. Chips, search and the view toggle run their handlers twice (idempotent today). | Drop the bare `init()` calls and init only on `astro:page-load`, with a per-root `data-bound` guard. Pattern in Proposal §1. | S |
| 14 | P2 | `src/lib/chat.ts:213-227`, `pages/api/chat.ts:70` | Error state. No `response.ok` check. A 500 from seed #4 returns Astro's HTML error page, `response.json()` throws, and the user sees "I couldn't reach the agent", which is wrong when the agent is reachable but Sanity failed. No retry affordance. `answer.suggestions` (sent on `suggest`) is never rendered. | Check `response.ok`. Show `error` text with a "Try again" button that re-asks. Render `suggestions` as `SuggestionChip`s in the agent turn (the template already exists). | S |
| 15 | P2 | `src/components/Composer.astro:27-31` | "Works without JavaScript" claim: a no-JS submit POSTs to `/api/chat` and the browser shows raw JSON. | Either drop `action`/`method` and say JS is required, or make `/api/chat` return a 303 to `/?q=` when `accept` is `text/html`. Owner question. | S |
| 16 | P2 | `src/lib/chat.ts:201`, `index.astro` | After send, focus stays on the input (fine with Enter), but clicking Send leaves focus on the button and `scrollIntoView` on the whole log jumps. There is no focus target when the answer lands. | Keep focus in the field after submit (`field.focus()`). Scroll the new agent turn into view (`block:"nearest"`), not the log. | S |
| 17 | P2 | `MobileDrawer.astro:78-90` vs pen `uaeM2` (`Ocrjj` Light, `q8Jl06` Dark) | Forest is unreachable below 720px (the TopBar toggle is `display:none`). A forest user opening the drawer sees neither option pressed. The SSR markup has no `aria-pressed` until JS runs. | Owner decision: add Forest to pen `uaeM2` and then the drawer, or show forest as pressed-on-"Light". Render `aria-pressed="false"` server-side. | S |
| 18 | P2 | `MobileTabBar.astro:47`; `layouts/Browse.astro:51`, `pages/projects.astro:51` | `aria-current` on a `<button>` (Profile opens a dialog: use `aria-haspopup="dialog"` and no `aria-current`). Every browse page passes `mobileTab="explore"`, so on `/bookmarks` Explore is "current" and Saved is not. | `mobileTab={active==="bookmarks" ? "saved" : "explore"}` in Browse/projects. Remove `aria-current` from the button branch. | S |
| 19 | P2 | `FilterBar.astro:25`, `pages/projects.astro:81` | Topic filters are a `<nav aria-label="Filter by topic">`, which adds a fake navigation landmark on 6 routes. The filter result count isn't announced. | `<div role="group" aria-label="Filter by topic">`, plus a visually hidden `role="status"` "N shown" updated in `apply()`. | S |
| 20 | P2 | `Sidebar.astro:173-215`, `MobileDrawer.astro:182-245`, `MobileTabBar.astro:71`, `Footer.astro:76`, `TopBar.astro:74`, `ContentCard`, `BookmarkFolder`, `TestimonialCard`, `TimelineEntry`, `ChatCard` | No `:focus-visible` style on most links. They fall back to the UA ring, which is invisible-ish on `--a-sidebar`/`--a-surface` in dark. `Composer.astro:67-72` removes the outline and substitutes a 2px `accent-soft` ring (1.14–1.20:1 against surface, which fails WCAG 1.4.11). `Input.astro:67-71` uses a 1px border colour change only. | One global rule in `tokens.css`: `:where(a,button,input,[tabindex]):focus-visible{outline:2px solid var(--a-accent);outline-offset:2px}`. Composer: `:focus-within{outline:2px solid var(--a-accent)}`. Delete the per-component copies. | S |
| 21 | P2 | `Footer.astro:43`, `ProjectCard.astro:75,97`, `BookmarkFolder.astro:47`, `TestimonialCard.astro:47`, `TimelineEntry.astro:50`, `chat.ts:151` | `target="_blank"` with no cue (891 on `/bookmarks`). Footer fallback is `href="#"` when `webUrl` is missing. | Visually hidden " (opens in a new tab)" plus an `external-link` icon via a shared `<ExternalLink>`. Skip rendering a link with no URL. Consider dropping `_blank` for bookmarks. | S |
| 22 | P2 | `ContentCard.astro:50`, `ProjectCard.astro:75`, `pages/articles.astro`, `codepen`, `projects`, `testimonials` | Heading outline: archive pages are `h1` followed by cards with no headings (card titles are plain `<a>`), so SR heading navigation finds only the page title. `skills` `h2`s have leading whitespace from data (`" Tools & Frameworks"`). | Wrap card titles in `<h2>` (or `h3` under a section `h2`). `.trim()` category names in `queries.ts`/the page. | S |
| 23 | P2 | `pages/404.astro:6` | The 404 has no AppShell (no nav, no theme toggle). It gets `canonical=/404/` (see #10). Unmatched `/articles/<slug>` links (seed #5) land here. | Use AppShell and `<Seo noindex>`. Until seed #5 lands, make the 404 suggest `/articles`. | S |
| 24 | P2 | `pages/bookmarks.astro` → `dist/client/bookmarks/index.html` | 774 KB HTML (87 KB gz), ~880 rows all in the DOM. The view-transition snapshot plus client filtering over 880 nodes is heavy on mobile. | Render folders collapsed (`<details>`), or paginate per folder, or index search to JSON fetched on first keystroke. | M |
| 25 | P2 | `Base.astro:45-50`, `tokens.css:57` | Render-blocking third-party Google Fonts CSS on every page. `Geist Mono` (`--af-mono`) is never loaded, so all mono text (counts, tags, meta, "EXPLORE") falls back to the system mono, off-pen. Instrument Serif italic is downloaded but nothing in `src/` uses italic. | Self-host via Astro's Fonts API / `@fontsource` (Inter 400/500/600, Instrument Serif 400, Geist Mono 400/500) with `font-display: swap` and preload of Inter 400 only. That removes 2 origins and fixes the missing mono. | S |
| 26 | P3 | `TimelineEntry.astro:39`, `TestimonialCard.astro:37` | Sanity images are served at the original size (100–200 px, mixed jpg/webp) for 44/32 px slots, with no `auto=format` and no DPR variants. | `@sanity/image-url` builder: `.width(88).height(88).fit("crop").auto("format")`, plus `srcset` 1x/2x. `width`/`height` attributes are already present (good). | S |
| 27 | P3 | `public/_headers:6-12` | No CSP. No HSTS or `Permissions-Policy`. HTML has no `Cache-Control` (Workers default). `X-Frame-Options` without `frame-ancestors`. | Add `Content-Security-Policy` (self, `cdn.sanity.io` img, fonts once self-hosted, `'unsafe-inline'` script for the theme snippet or hash it), `Strict-Transport-Security`, `Permissions-Policy`. HTML `Cache-Control: public, max-age=0, must-revalidate`. | S |
| 28 | P3 | `MobileTopBar.astro:43`, `MobileDrawer.astro:344` | "Go back" = `history.back()`. On a deep link it leaves the site. | `history.length > 1 && document.referrer.startsWith(location.origin) ? history.back() : location.assign("/")`. | S |
| 29 | P3 | `MobileTopBar.astro:37` | Avatar initials link to `/bookmarks` labelled "Your saved items", which is confusing for a visitor-facing portfolio. | Owner/pen check. If kept, label it "Saved bookmarks". | S |

Reduced motion is handled correctly: global `animation-duration: 0.001ms` in `tokens.css:101-109`, and view transitions are disabled in `Base.astro:104-110`. JS shipped per page is small (ClientRouter 16 KB, the chat island 3.4 KB, everything else under 1 KB each). `_astro/*` is cached immutable.

## Proposal

### 1. One island-lifecycle pattern

Rule: **module scope holds only document-level delegated listeners, bound once. Per-page DOM is found on `astro:page-load` and is never cached across pages. Per-root binding is idempotent through a `data-bound` flag. Anything that must hold state across pages lives at module scope and is reset explicitly.** Theme is applied on `astro:before-swap`, so the new snapshot is already correct.

```ts
// src/lib/island.ts
type Cleanup = void | (() => void);

/**
 * Run `setup` once per matching root per page-load. Idempotent: a root that
 * is already bound is skipped. Cleanup runs before the next swap.
 */
export function island(selector: string, setup: (root: HTMLElement) => Cleanup) {
  let cleanups: (() => void)[] = [];
  const mount = () => {
    for (const root of document.querySelectorAll<HTMLElement>(selector)) {
      if (root.dataset.bound === selector) continue;
      root.dataset.bound = selector;
      const c = setup(root);
      if (c) cleanups.push(c);
    }
  };
  document.addEventListener("astro:page-load", mount); // fires on first load too (router.js:492)
  document.addEventListener("astro:before-swap", () => { cleanups.forEach((c) => c()); cleanups = []; });
}

/** Delegated, bound once per document lifetime; look elements up at event time. */
export function delegate(type: string, selector: string, fn: (el: HTMLElement, e: Event) => void) {
  document.addEventListener(type, (e) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>(selector);
    if (el) fn(el, e);
  });
}
```

Usage sketch:
```ts
// MobileDrawer
const drawer = () => document.querySelector<HTMLDialogElement>("[data-drawer]");
delegate("click", "[data-drawer-open]", () => drawer()?.showModal());
delegate("click", "[data-drawer-close]", () => drawer()?.close());
document.addEventListener("click", (e) => { if (e.target === drawer()) drawer()!.close(); });
// chat
island("[data-chat-root]", (root) => { const ac = new AbortController(); form.addEventListener("submit", onSubmit, { signal: ac.signal }); return () => ac.abort(); });
```

Files to convert:
- `src/lib/chat.ts`: `island("[data-chat-root]")`; module-scope `thread` with `reset()`. Move the `[data-new-chat]` delegate into `src/lib/shell.ts`.
- `src/lib/browse.ts`: `island("[data-browse]")`.
- `src/pages/projects.astro` script: fold into `browse.ts`. It duplicates the filter logic, and the view toggle becomes an option.
- `src/components/MobileDrawer.astro`: `delegate()`, no cached nodes.
- `src/components/ThemeToggle.astro`: one delegate for every `[data-theme-option]` (desktop and drawer). `paint()` runs on page-load. Theme application moves to `Base.astro`'s inline script, with a `before-swap` hook.
- `src/layouts/AppShell.astro`: scroll memory gets hash-aware restore (#6).
- `src/components/SuggestionChip.astro` and `MobileTopBar.astro`: already delegated. Move them into `shell.ts` for one place.

New `src/lib/shell.ts`, imported once by `AppShell.astro`, holds every document-level delegate: new-chat, drawer, theme, search-focus, suggestion chips.

### 2. `<Seo>` component spec (rendered by `Base.astro`)

`src/components/Seo.astro`, which replaces `Base.astro:32-43`. `Base` takes `seo?: SeoProps` (keep `title`/`description` as shorthand).

| prop | type | default |
|---|---|---|
| `title` | string | required. Rendered as `` `${title} — Badger3000` `` unless `titleAbsolute` |
| `titleAbsolute` | boolean | false (home uses "Badger3000 — Kyle Ross's AI") |
| `description` | string | site default from `siteSettings.description` (fallback: the current string) |
| `path` | string | `Astro.url.pathname`, with the trailing slash stripped |
| `canonical` | string \| false | `new URL(path, SITE_URL)`. `false` on 404 |
| `noindex` | boolean | false. 404 and draft previews set it to true |
| `image` | `{ url, width, height, alt }` | `/og/default.png` 1200×630 (port from Next `/images/header-image-06.webp`) |
| `type` | `"website" \| "article" \| "profile"` | `"website"`. Home uses `"profile"` |
| `article` | `{ publishedTime, modifiedTime?, author: "Kyle Ross", section?, tags?[] }` | Only with `type="article"` |
| `jsonLd` | object \| object[] | `Person` + `WebSite` on `/`. `Article` on the article variant |

It emits: `<title>`, description, canonical, `robots` (`noindex,follow` when set), `og:{type,site_name,locale=en_US,title,description,url,image,image:width,image:height,image:alt}`, `twitter:{card,title,description,image,creator}`, the `article:*` tags, `<link rel="manifest">`, `apple-touch-icon`, `icon` 192/512 plus svg, `theme-color` per theme (`media` light/dark), `<link rel="alternate" type="application/rss+xml" href="/rss-feed.xml">` (once the feed exists, seed #6), and `<script type="application/ld+json">`.

`SITE_URL` comes from `astro.config.mjs` `site`, the single source. Robots, sitemap and the Seo component all read `Astro.site`, so the www/apex choice is made once.

Per-route overrides: browse pages already pass title/description through `Browse.astro`. Add `image` per archive when the pen gets OG art. `/` gets `titleAbsolute`, `type:"profile"` and the `Person` JSON-LD (name, url, `sameAs` = `siteSettings.links[].webUrl`, jobTitle).

Article variant (pen `I4mvDB` Article — Detail: Category, Title, Excerpt, Byline author/date/read time, Hero Image): `articles/[slug].astro` passes `title=post.title`, `description=excerpt`, `image=urlFor(post.mainImage).width(1200).height(630).fit("crop").auto("format")`, `type:"article"`, and `article={publishedTime: post.publishedAt ?? _createdAt, modifiedTime: _updatedAt, tags}`. That is the same as Next's `app/articles/[slug]/page.tsx:60-110`. JSON-LD is `BlogPosting` (headline, datePublished, dateModified, author `Person`, image, mainEntityOfPage). Note: Next's root layout sets every page's canonical to the homepage (`app/layout.tsx:41-47,61`). Don't port that bug.

### 3. Prioritised a11y fixes (Phase B order)
1. Drawer and shell lifecycle (#1, #3, #13): mobile nav is currently unusable after one navigation.
2. Chat thread correctness (#2, #4) and the live region (#7): screen-reader users currently hear the whole thread every turn.
3. Contrast tokens (#8, #9): pen first, then `tokens.css`. This affects every page.
4. Global focus-visible rule and Composer focus ring (#20).
5. Hash scroll and Education `aria-current` (#6). Tab-bar `aria-current` (#18).
6. Filter landmark plus result-count status (#19). Card headings (#22).
7. External-link cues (#21). Back button fallback (#28).
8. Forest in the drawer (#17), after the owner decides.

## Cross-lane notes
- Seed #4 is user-visible as a misleading "couldn't reach the agent" (#14). The fix belongs to the api lane, the client side to this one.
- Hardcoded colours break the "tokens only" rule: `TopBar.astro:57` `#3bbe7a`, `MobileDrawer.astro:124` backdrop `#0c0c0a`, and the `ContentCard` cover gradients inline in HTML (`articles/index.html`, e.g. `#cbd9f2`).
- `projects.astro:216-271` reimplements `browse.ts`, which is a code-health lane item.
- The cmux browser profile's `sessionStorage` seemed shared with other panes: a turn I didn't type ("how can I contact ky…") appeared in my thread. Lanes testing chat may see each other's state.
- The build emits a 13 KB shared CSS chunk named `sanity.*.css`. The chunk naming is misleading. Check what the `lib/sanity` import pulls into the client graph (build/infra lane).

## Open questions for the owner
1. Canonical host: `www.badger3000.com` (today's live site, Next, all docs) or apex (`astro.config.mjs site`)? With or without the trailing slash? I recommend www and no slash, to keep existing ranking.
2. Forest on mobile: add it to pen `uaeM2`, or keep forest desktop-only (and then what should the drawer show for a forest user)?
3. Should the chat work without JS (form POST → server-rendered answer), or is JS required and the `action` should go?
4. Bookmarks: keep all ~880 in one page, or collapse/paginate? Should they open in new tabs?
5. OG image: reuse Next's `/images/header-image-06.webp`, or design one in the pen (per-archive variants)?
