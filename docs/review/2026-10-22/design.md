# design review

## Summary

- The semantic tokens match the pen exactly in all three skins (light, dark, forest). The problems are around them: the pen still carries 19 v1 variables, `--a-on-accent` exists only in code, and there are no tokens for status green, the brand badge, overlays or cover gradients, so 26 hex literals remain in components and pages.
- 4 of the 21 masters have no file: Avatar, AvatarUser, NavItem and FeatureCard. Their markup is copied inline instead (the 🦡 mark in 6 places, the nav list in 2). `ProjectCard.astro` is really the FeatureCard (`f3kriq`), not `FE7oC`.
- Recurring code drift: several masters lose their pen stroke (IconButton, StatTile, Composer, SuggestionChip, ShieldsBadge). The most visible effects are a borderless composer on Home and centred StatTile icons on /golf.
- Mobile (390px) overflows horizontally on /projects. The cards, the search field and the 4th tab are clipped, because `AppShell` uses `1fr` rather than `minmax(0,1fr)`.
- The detail screens `I4mvDB` and `vKVLC` have **no `context` bindings** and contain clipped nodes. The article code block uses the v1 palette (54 nodes). A build-ready spec is in the Proposal.

## Findings

| # | sev | where | problem | fix | effort |
|---|---|---|---|---|---|
| 1 | P1 | `apps/web/src/layouts/AppShell.astro:121` (`.shell` at ≤720px) | `grid-template-columns: 1fr` resolves to `minmax(auto,1fr)`, so the column grows to the min-content width of the PageHeader actions (Ask, the 220px Input and the view toggle, about 450px). At 390px the cards are clipped on the right, the search field is cut off and the `Profile` tab is pushed off-screen (headless Chrome screenshot at 390×844 of `/projects`). | Use `minmax(0, 1fr)`. Also follow pen `Fn67n`: at ≤720px hide `.ask` and the inline Input in the PageHeader actions. Mobile search is the `aE6rX` icon in `MobileTopBar` (yM5Vm). | S |
| 2 | P1 | `components/StatTile.astro:36-40` | `.ico { display:grid; place-items:center }` is a stretched flex child, so the icon renders **centred** across the tile (visible on `/golf`). The pen (`Saf7N`, vertical layout) puts the icon top-left. | `.ico { display:flex; }` (or `align-self:flex-start`). | S |
| 3 | P1 | `components/StatTile.astro:28-35` | Missing the pen stroke `$a-line`. Tiles have no edge on `$a-bg` and float on /golf. The pen also shows **4** tiles; `pages/golf.astro:46-54` renders 3, while its own header comment says "× 4". | Add `border:1px solid var(--a-line)`. Either add the 4th stat or change the pen to 3 (see Open questions). | S |
| 4 | P1 | `components/Composer.astro:46-53` | The pen `c2P43y` has stroke `$a-line-2`; the code has no border. On Home the composer is a white bar on an off-white page with no edge (compared with `l7yp4`). | `border:1px solid var(--a-line-2)`. Keep the `:focus-within` ring. | S |
| 5 | P1 | `components/ProjectCard.astro:124` | The cover is one hardcoded coral gradient, so all 9 cards on /projects look identical. The pen grid (`uXl4B`, `f3kriq` overrides) uses a different gradient per card, and `ContentCard` already uses `gradientFor(id)`. | `style={`background:${gradientFor(project.id)}`}`. Remove the literal. | S |
| 6 | P1 | `components/ProjectCard.astro` (whole file) vs `f3kriq`/`FE7oC` | One file mixes two masters: it has FeatureCard's structure (year, category, tech row, arrow) with ProjectCard's metrics (radius 14, monogram 44, title 15.5, desc 12.5/1.4). FeatureCard specifies radius 8, monogram 56, title 16/1.25 and desc 13/1.45. The compact `FE7oC` (4 slots, used in the detail "related" rows) has no implementation. | Rename the file to `FeatureCard.astro` and apply the `f3kriq` metrics, after the pen fix P-3 sets radius 14. Add a compact `ProjectCard.astro` = `FE7oC` (cover, Tag, title, desc) for the detail screens. | M |
| 7 | P2 | `components/IconButton.astro:28-45` | `HFjfa` has stroke `$a-line-2`; the code uses `border:0`. The `accent` variant hardcodes `color:#fff`. | Add `border:1px solid var(--a-line-2)`. Make `.accent` use `border-color:transparent; color:var(--a-on-accent)`. | S |
| 8 | P2 | `components/SuggestionChip.astro:36` | `TPq9Z` has stroke `$a-line-2`; the code border is `transparent`, so the chips have no edge on Home. | Set `border-color: var(--a-line-2)`. | S |
| 9 | P2 | `components/SuggestionChip.astro:9-11,61-73` | The comment and script say "/api/chat lands in phase 4", but it has shipped (`20da2ca`). The global click handler only fills the input and does not submit, which is a design decision that is now stale. | Update the comment. Decide whether a chip submits (the pen Conversation flow implies it does). If so, call `form.requestSubmit()` after filling. | S |
| 10 | P2 | `components/ShieldsBadge.astro:24,32,37-47` | (a) The pen key/value font is `$af-mono`; the code uses `--af-ui`. (b) The pen has stroke `$a-line`. (c) When `badgeLabel` is empty, the coloured value half is dropped entirely, so `skill.badgeColor` is lost. The pen always renders the Value segment with `fill ← skill.badgeColor`. (d) Hardcoded `#fff` and `#2b2f36`. | Use mono and add the border. Render the value segment whenever `color` is set (an empty 8px swatch when there is no label). Move the colours to `--a-badge-key` and `--a-on-accent`, see the tokens proposal. | S |
| 11 | P2 | `components/Composer.astro:9-11,35` | The comment says it "404s until phase 4" (stale). `id="composer-q"` is a fixed id, so two composers on one page collide (`for=` points at the first). | Make the id a prop or `composer-${Astro.props.id ?? "q"}`. Fix the comment. | S |
| 12 | P2 | `components/Sidebar.astro:61-68`, `MobileDrawer.astro:28-…` | No `NavItem.astro` (`LDNXV`). The nav entry array is duplicated in Sidebar and MobileDrawer, and so is the item markup. | Extract `NavItem.astro` (`a`, props `href, icon, label, count?, active?`). Move the `nav` array to `lib/nav.ts` and import it in both. | S |
| 13 | P2 | `Sidebar.astro:44`, `AgentMessage.astro:19`, `MobileTopBar.astro:34`, `MobileDrawer.astro:48`, `pages/index.astro:40`, `pages/404.astro:8` | No `Avatar.astro` (`Xu2VY`). The 🦡 mark is restyled six times at 26, 30, 36 and 76px, each with its own radius and font. `Sidebar.astro:119` hardcodes `font-family: Inter`. | Create `Avatar.astro` with props `size: 26\|30\|36\|76`. Radius and glyph size come from a size map taken from the pen overrides (26→r9/13px, 30→r9/16px, 36→r11/18px). | S |
| 14 | P2 | `Sidebar.astro:77-83,229-239` | No `AvatarUser.astro` (`kF8ut`). The initials are computed inline. The pen binds `initials ← settings.name`. | Create `AvatarUser.astro` (`span`, props `name, size=32`), which derives the initials itself. Reuse it on the Article — Detail byline (`dZFPE`). | S |
| 15 | P2 | `Sidebar.astro:52-65` vs `P2anH` | NewChat in the pen is a `Button` instance (padding 11/18, radius 11, 14/600, overridden to `$a-surface` and `$a-line-2`). The code is a bespoke link: padding 11/12, 13.5/500, `plus` at 15. | Render it with `<Button variant="secondary" href="/" label="New conversation">` and an icon slot. If 13.5/500 is the intended look, put that override on `P2anH` in the pen. | S |
| 16 | P2 | `TopBar.astro:28-31,74-93`; `AskBadger.astro`; inline `.ask` in `pages/projects.astro:58-61` | Résumé (`vqw23`) and AskBadger (`YKe19`) are both `Button` instances with overrides in the pen. The code has a bespoke `.resume` with radius 9 (pen 11), a separate `AskBadger.astro`, **and** a third inline copy of the Ask pill in projects.astro. | Add `size: "md"\|"sm"` and `variant: "soft"` to `Button.astro`. Then Résumé = `secondary sm` and Ask = `soft`. Delete the inline `.ask` in projects.astro (use `AskBadger` or Button). | S |
| 17 | P2 | `TopBar.astro:57` | Online dot `#3bbe7a` is hardcoded (the pen hardcodes it too, `cuSkI`). | Add a `--a-ok` token and use it in both the pen and the code. | S |
| 18 | P2 | `PageHeader.astro` vs `a1JCtb` | The master has `Filters` *inside* the header (props `title, count, filters[]`), but every browse screen draws the filter row as a sibling with a sort control on the right. The code follows the screens and takes no `filters` prop. | Fix the pen (P-4): drop `Filters` from the master and change its context to `props: title, count, sub, actions(slot)`. Then extract `FilterBar` as the shared row (the `FilterBar.astro` file already exists). | S |
| 19 | P2 | `pages/golf.astro` vs `oH8H5` | The bar chart is all neutral, while the pen fills one bar with `$a-accent` (the latest/best round). The pen table has a 4th "± par/diff" column, which the code lacks. The `SCORE` header is bold and larger than the other mono headers (`th.score` picks up `td.score` styling). | Accent the best-round bar. Scope `.score` to `td`. The diff column needs a field (`par` is not in the `golfScores` schema), so either drop it from the pen or add the field. | S |
| 20 | P2 | `pages/articles.astro:113-145` | The featured card has the coral gradient and white alpha text colours hardcoded (`#ffffffcc`, `#ffffffe0`, `#ffffffaa`), so it ignores `gradientFor` and the skins. | Use `gradientFor(featured.id)`, and `--a-on-cover` / `--a-on-cover-muted` tokens. | S |
| 21 | P2 | `pages/articles.astro` vs `Wmn35` | Search sits in the filter row in the code; the pen puts it in the PageHeader actions next to Ask Badger. Projects follows the pen, so the two pages disagree. | Move the `Input` into `slot="actions"`. | S |
| 22 | P2 | `ContentCard.astro:75-96`, `MobileDrawer.astro:124`, `TimelineEntry.astro:85`, `BookmarkFolder.astro:117`, `TestimonialCard.astro:96`, `ProjectCard.astro:133,142-143` | Remaining hardcoded colours: `#17171c` window cover, `#ffffff26`/`#ffffff1f`/`#ffffff29`/`#ffffffe0` overlays, `#0c0c0a` scrim, and `#fff` on tinted marks. | Map them as listed in the tokens proposal: `--a-on-accent`, `--a-on-cover*`, `--a-cover-window`, `--a-scrim`. | S |
| 23 | P3 | `MessageBubble.astro:6` | The comment says "radius 15 · padding [10, 15]"; both the code and the pen use 16/[11,16]. | Fix the comment. | S |
| 24 | P3 | `AgentMessage.astro:35` | `max-width:620px`; master `CVVRV` is 460 wide (the conversation screens stretch it). | Leave the code as is, but set the pen master to `fill_container` with max 620 so the pen and code agree. | S |
| 25 | P3 | `Footer.astro:6-8` vs screens | The runbook says `RGuEe` is a reusable Footer master. **It does not exist on the canvas any more** (`Get("RGuEe")` fails and there are 0 refs). Every screen has a local `Footer` frame whose copy text uses the v1 `$f-body` font (Barlow Semi Condensed), 1 node per screen. The code uses text links where the pen has icon links. | Pen fix P-1. Update the runbook map row. | S |
| 26 | P2 | pen `I4mvDB`, `vKVLC` | Neither detail screen has a single `context` string: there are no semantic tags and no Sanity bindings. | Pen fix P-6. The binding table is in the Proposal below. | M |
| 27 | P2 | pen `vKVLC` | Clipped layout: `N3CvY` Title is 880 wide inside an 856 Header, `KlKLZ` Preview is 936 inside an 856 wrap, and 5 of the 6 stage buttons in `oEzwd`/`TKrMO` are fully clipped. | Set Title and Preview to `fill_container` and re-lay the stage fields. | S |
| 28 | P2 | pen `I4mvDB` → `C2I66` Code block | 54 nodes use v1 primitives (`#1A1A22`, `#26262C`, `#E9E4D8`, `#F4C400`, `#36C3D6`, `#9A968C`). The syntax theme is not on the token board, so it cannot follow the skins. | Add `--a-code-*` semantic tokens (bg, head, text, comment, keyword, string) to the board and bind them. | S |
| 29 | P3 | pen `I4mvDB` → `bRJFE` | Related card 1 (`JVTua`) is 195 tall and the other two are 213. Its override gradient goes coral → `#FAFAF8`, which is not one of the palette pairs. | Align the heights and use a `palette.ts` pair. | S |
| 30 | P3 | pen `f3kriq` | FeatureCard has no `context`. It uses `layout:none` with absolute children and a fixed height of 220, and its radius 8 differs from every other card (14). The `Year` Tag sits at x0/y0 with no padding. | Pen fix P-3. | S |

## Proposal

### A. `packages/ui` — what moves, what stays

**Presentational masters → `packages/ui`.** These are pure, have props and no app imports.

| component | pen | props API (changes in **bold**) |
|---|---|---|
| Button | `CTvHL` | `variant: primary\|secondary\|ghost\|**soft**`, **`size: md\|sm`**, `label`, `href?`, slots `icon`, `trailing`. Absorbs AskBadger, Résumé and NewChat. |
| Tag | `rw7Gc` | `label`, **`tone?: accent\|onCover`** (onCover = the transparent year stamp from `f3kriq`) |
| CountBadge | `e4RkB0` | unchanged |
| ShieldsBadge | `NjGub` | `name`, `color?`, `value?`. Renders the value segment when `color` is set. |
| **Avatar** (new) | `Xu2VY` | **`size: 26\|30\|36\|76`** |
| **AvatarUser** (new) | `kF8ut` | **`name`, `size=32`** (derives the initials) |
| Input | `WIcVr` | unchanged; `width` should also accept `"100%"` for mobile (it already takes a string) |
| IconButton | `HFjfa` | `icon`, `label`, `variant: surface\|accent\|**ghost**` (ghost = no border, used by MobileTopBar) |
| FilterChip | `RA61q` | unchanged |
| **NavItem** (new) | `LDNXV` | **`href, icon, label, count?, active?`** |
| StatTile | `Saf7N` | unchanged (fixes #2 and #3) |
| Card | `I2gPrr` | `as`, `class`; **drop the fixed `width:260px`** (callers size it; no current caller wants 260) |
| **FeatureCard** (renamed from ProjectCard) | `f3kriq` | **`title, href?, topic?, excerpt?, tech[], year?, seed`** (plain fields, not a Sanity `Project`, so the package does not depend on `packages/sanity` types) |
| **ProjectCard** (new, compact) | `FE7oC` | **`title, href, topic?, excerpt?, seed`** for the detail related rows |
| ContentCard | (local frames in `Wmn35`/`fDntQ`) | unchanged; add `seed` and remove the internal `gradientFor` import by passing `cover` as a string |
| SuggestionChip | `TPq9Z` | `label, prompt, icon?`. **Move the document-level click script out** to `apps/web/src/lib/chat.ts`; the package component only renders `data-suggestion`. |
| PageHeader | `a1JCtb` | `title, count?, countLabel?, sub?`, slot `actions` |
| FilterBar | (screens) | `chips[], active`, slot `trailing` (sort) |
| Icon | (pen `icon` nodes) | unchanged; owns the `lucide-static` dependency |
| TimelineEntry, TestimonialCard, BookmarkFolder | no masters yet | move once masters exist (pen fix P-5). Until then they stay in the app. |

**App shell and chat islands → stay in `apps/web`.** They are tied to routing, `sessionStorage`, `ClientRouter` or the chat template contract: AppShell, Base, Browse layouts, Sidebar, TopBar, ThemeToggle, MobileTopBar, MobileDrawer, MobileTabBar, Footer (it reads `SiteSettings`), Composer (it is the `/api/chat` form), MessageBubble, AgentMessage and ChatCard. The last three are the `<template data-chat-*>` sources for `lib/chat.ts`, so they must stay next to it. Sidebar and MobileDrawer then compose `NavItem`, `Avatar` and `AvatarUser` from the package.

### B. `packages/tokens`

- `tokens.css` contains tier 1 (`--p-*`, `--g-*`), tier 2 (`--a-*` light default plus `[data-theme=dark]`/`[data-theme=forest]`), type (`--af-*`) and motion (`--duration-*`, `--ease-*`, `--distance-*`) **plus** the `@keyframes turn-in`/`dot-pulse` they serve.
- **New semantic tokens.** Add them to the pen board first, then the CSS:
  - `--a-on-accent` (already in code at line 52; **missing on the pen board**)
  - `--a-ok` (#3BBE7A)
  - `--a-badge-key` (#2B2F36)
  - `--a-on-cover` (#fff) and `--a-on-cover-muted` (#ffffffcc)
  - `--a-cover-overlay` (#ffffff29)
  - `--a-cover-window` (#17171c)
  - `--a-scrim` (#0c0c0a, plus an opacity decision)
  - `--a-code-bg`, `--a-code-head`, `--a-code-text`, `--a-code-comment`, `--a-code-keyword`, `--a-code-string`
  
  Set dark and forest values where they differ (at least `--a-code-*` and `--a-scrim`).
- **Stays out of tokens, in a separate `base.css` in the same package:** the box-sizing reset, `html`/`body` defaults, `color-scheme` and the `prefers-reduced-motion` kill switch. Today they share `tokens.css:101-157`. Splitting them lets the Studio or a future embed import the variables without the reset. Also add `[data-theme="forest"] { color-scheme: light }` so it is explicit.
- **TS map: yes, small.** Emit `tokens.ts` exporting `themes = ["light","dark","forest"] as const` and the `--a-*` names as a union type. `lib/theme.ts` and `ThemeToggle` then type-check against it, and the chat card `--i` and similar custom properties stay checked. Do not emit values in the TS map: CSS is the only value source.
- **`lib/palette.ts` → `packages/tokens/covers.ts`.** These are design data (the pen's cover gradients and tints), not app logic. Each pair becomes a pair of primitives `--p-cover-N-from/-to`. `gradientFor(seed)` returns `linear-gradient(220deg, var(--p-cover-N-from), var(--p-cover-N-to))`, so the hex values live once, in CSS. Keep `tintFor` the same way. Callers: ContentCard, FeatureCard, ProjectCard, articles featured, TimelineEntry and BookmarkFolder.
- Generation: a hand-maintained file is fine at this size, but add a `tokens:check` script that runs `GetVariables()` through the pencil MCP and diffs it against the CSS. Today the files match 1:1 on `--p-*`, `--g-*` and `--a-*`.

### C. Pen corrections (the schema or code is right, the pen is wrong)

- **P-1** Re-create the reusable **Footer** master (`RGuEe` is gone from the canvas) and swap the 21 local `Footer` frames for refs. Its copy text must use `$af-ui`, not v1 `$f-body`. Then **delete the 19 v1 variables** (`bg-void`, `bg-panel`, `bg-panel-2`, `paper`, `ink`, `red`, `red-deep`, `yellow`, `cyan`, `text-hi`, `text-mid`, `text-dim`, `line`, `line-soft`, `f-display`, `f-head`, `f-body`, `f-mono`, `f-jp`). Once the footers move, `$f-body` is their only remaining use. The socials are text links in code because lucide has no brand glyphs; draw them as text in the pen too.
- **P-2** `FE7oC` ProjectCard context: `← project{title,topic,tech[],webUrl,order}` and Desc `← project.excerpt`. The schema has **no `excerpt`**; the projection flattens `project_description[0]`. Change the context to `← project.excerpt (= project_description[0] text)`. Drop `tech[]`/`webUrl` from the context because the compact card has no slots for them (they belong to FeatureCard). Alternatively, add an `excerpt` string field to `schemas/parts/projects.js` (open question 1).
- **P-3** `f3kriq` FeatureCard: add context `article · FeatureCard ← project{title,topic,excerpt,tech[],webUrl,_createdAt}`. Convert it to auto layout (vertical; Body padding 14, gap 7). Set radius 14 to match every other card. Bind `Year ← year(project._createdAt)` (there is no year field, so note it), place it bottom-left with 12px inset, and bind Monogram to `← project.title[0]`. The cover gradient context becomes `fill ← gradientFor(project._id)`.
- **P-4** `a1JCtb` PageHeader: remove `Filters` from the master and update the context as in finding #18.
- **P-5** Promote the screen-local TestimonialCard, TimelineEntry, BookmarkFolder+row, GolfRow and GolfBarChart to masters. The code already has components for the first three.
- **P-6** Add `context` to every slot in `I4mvDB`/`vKVLC`, as in section D. Fix the clipping (#27), the code-block tokens (#28) and the related card height (#29).
- **P-7** Fix the bindings in Experiments — Detail that the schema cannot satisfy. `codepen` has no tech array, publish date, fork count or heart count, so the `Meta` row (`uEut9`), `Tech block` (`pS6dU`), Fork/Heart CTAs and the PFooter "412 hearts" are invented. Either drop them, or bind Meta date to `_createdAt` and Tech to `topic->title` only.
- **P-8** Golf `oH8H5`: the 4th StatTile and the table's diff column have no schema backing (`golfScores` = course, date, score). Remove them or specify the derived value.
- **P-9** Add `a-on-accent` and the new tokens from section B to the Design Tokens board (`Jy3WM`). Replace hardcoded `#FFFFFF` on accent fills (Button label, Send icon) with `$a-on-accent`, and `#3BBE7A` with `$a-ok`.

### D. Detail views — build-ready spec

Routes: `pages/articles/[slug].astro` and `pages/codepen/[slug].astro`, both prerendered with `getStaticPaths`, inside `AppShell` (Sidebar `active="articles"`/`"experiments"`). The content column is `max-width: 856px` (the header row), with text at 720px (article) or 760px (experiment), centred, and padding `40px 80px`, which collapses to `16px` at ≤720px.

**Article — Detail (`I4mvDB`)** — `article` element, query `articleBySlugQuery`

| slot (pen id) | element / component | binding (schema `articles`) |
|---|---|---|
| Back `Z6YQK` | `a` + Icon `arrow-left` 14, 13px `--a-muted` | static `/articles` |
| Category `nwqxJ` | `Tag` | `topic->title` |
| Title `hdneG` | `h1`, `--af-display` 56/1.05, 800 max | `title` |
| Excerpt `OEYrI` | `p.lede`, 18 `--a-muted` | `excerpt` (optional; hide when null, do **not** use the "Read more..." coalesce from the list query) |
| Byline `fZTwT` | `AvatarUser` 24 + `span`s, 13px, dots `--a-faint` | `coalesce(authorName, settings.name)` · `_createdAt` → "October 14, 2024" · read time = `round(length(pt::text(content)) / 1000)` min (computed in GROQ; there is no field) |
| Hero `jElxC`/`E840I` | `figure` with `<Image>` 800×380, radius 14 | `main_image` (asset, alt); caption overlay `H2Dot` ← `main_image.caption`; when there is no image, fall back to `gradientFor(_id)` |
| Body `N7Lpy` | Portable Text renderer, 720 wide: `p` 17/1.65 `--a-ink`; `h2` display 30; Lead (`ushIp`) = first block at 17 | `content` (blockContent) |
| Quote `lbRdD` | `blockquote` with 3px `--a-accent` bar | `blockContent` blockquote style |
| Code block `C2I66` | `pre > code` with a head row (dots and filename), `--a-code-*` tokens | `blockContent` `code` type (if blockContent has one; otherwise add it, open question 3) |
| Inline figure `kupWQ` | `figure` img 720×320 + `figcaption` 13 `--a-faint` | `blockContent` image + caption |
| Citation `nU1Ph` | `aside`, `--a-accent-soft` bg, radius 12; head 12 caps `--a-accent` | render only if `authorCitation`. Text: `disclaimer`; link: `originalArticleUrl`; author link: `authorProfileUrl` |
| Tags row `OBquW` | `ul` of `Tag` | `topic->title` only (the schema has no tags array; the pen shows 4, so cut it to one or add `tags[]`) |
| MoreHead `PhCX7` | `h2` display 26 + `a` "View all →" `--a-accent` | `/articles` |
| Related `bRJFE` | `ul` grid 3 × `ProjectCard` (`FE7oC`), gap 16; 1 column at ≤720px | `*[_type=="articles" && topic._ref==^.topic._ref && _id!=^._id][0...3]{title, "slug":slug.current, excerpt, "topic":topic->title}`; fall back to the latest 3 |
| Footer `xXmbL` | `Footer` (app) | settings links |

**Experiments — Detail (`vKVLC`)** — `article`, query `experimentBySlugQuery` (`codepen`)

| slot (pen id) | element / component | binding (schema `codepen`) |
|---|---|---|
| Back `cXcek` | `a` | `/codepen` |
| Topic `QYkEv` | `Tag` | `topic->title` |
| Title `N3CvY` | `h1` display 64 (48 at ≤720px), `fill_container` | `title` |
| Excerpt `R88BP` | `p.lede` 18, 720 max | `excerpt` (it is `text` in this schema) |
| Meta `uEut9` | `p` 13 | `"Published " + _createdAt`. The tech items have no field (P-7). |
| Preview `KlKLZ` | `figure` window: head (`WrRp1`: dots, slug tab), stage = **CodePen `<iframe>`**, footer (`RVhVi`: `codepen.io/…` link) | `embedCode` if present, else iframe `https://codepen.io/{user}/embed/{penUrl}?default-tab=result`; `loading="lazy"`, 16:9, `title={title}`. Stage gradient = the placeholder before the iframe loads. Dots use `--a-accent`/`--a-ok`/`--a-faint`, not v1 yellow/cyan. |
| CTAs `A3H11M` | `Button primary` "View on CodePen" (ink fill per the pen, a `variant="ink"` decision) + `Button secondary` Fork | `https://codepen.io/{user}/pen/{penUrl}`; Fork → `/pen/fork/{penUrl}`. Heart has no data, so drop it (P-7). |
| About `nwKOV` | `section` `h2` display 28 + Portable Text 16/1.65, 760 | `description` (blocks) |
| Quote `aoecx` | `blockquote` | blocks blockquote style |
| Tech block `pS6dU` | `ul` of `Tag` | no field (P-7); omit until the schema gains `tech[]` |
| More head / Related `hlf0Z`/`vMQY2` | `h2` "More in {topic}" + 3 × `ProjectCard` (`FE7oC`) | same-topic `codepen` query, 3 items, current item excluded |

**Responsive (both):**
- At ≤720px, the Sidebar and TopBar go away (existing behaviour) and `MobileTopBar` shows back plus the title.
- Hero and preview become full-bleed, minus the 16px gutters.
- Related collapses to a single column.
- Code blocks scroll horizontally inside `pre` (never the page).
- The title clamps with `font-size: clamp(36px, 7vw, 56px)` (64 for experiments).

**Fixes this unblocks:** the dead `/articles/{slug}` links in `pages/articles.astro:55,67,87` and `lib/agent/retrieve.ts:172`. `pages/codepen.astro:53` sends the user off-site when `penUrl` is set. Once the detail route exists, it should link to `/codepen/{slug}` instead.

## Cross-lane notes

- `components/Footer.astro:31-33,48`: the fallback social URLs (`github.com/kbadger`, `linkedin.com/in/kbadger`, `codepen.io/kbadger`) and `mailto:hello@badger3000.com` are guesses baked into code. Verify them against the Sanity `socialLinks` data, or drop the fallback (content/data lane).
- `components/SuggestionChip.astro:63` registers a document-level click listener at module scope. It runs once per page load, so it is not double-bound like seed finding #2, but it does depend on `[data-composer-input]` existing (chat lane).
- `pages/codepen.astro:53` links off-site to the raw `penUrl` hash string. If `penUrl` holds only a hash (the schema title is "CodePen Hash"), the link is broken (routes lane).
- `docs/runbooks/designing-from-the-pen.md`: the `Footer RGuEe` row and the "canvas held a reusable Footer" note are now false. Its table also has a stray FeatureCard paragraph splitting the table (docs lane).

## Open questions for the owner

1. Project excerpt: should we add a real `excerpt` string to `projects` (and a `year` number for the card stamp), or keep deriving them from `project_description[0]` and `_createdAt`?
2. Golf: which 4th stat did you intend (handicap? favourite course?), and do you want a `par` field for the diff column? Or should both come out of the pen?
3. Does `blockContent` have a `code` block type? If not, should Article — Detail's code block be dropped or should the type be added?
4. Should suggestion chips submit straight away, or just fill the composer?
5. Covers: the pen says gradient everywhere, but every project and most articles have real images. Should the detail hero use `main_image` while the cards stay gradient, as specified above, or should the cards switch to images too?
6. Should the Experiments CTA be ink-filled (pen `YCoqR`, a 4th Button variant), or is that the pen drifting from `primary`?
