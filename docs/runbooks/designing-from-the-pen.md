---
slug: runbook/badger3000-designing-from-the-pen
title: badger3000 — developing from the design .pen
status: active
date: 2026-10-22
---

# Developing from the design `.pen`

The visual design is the source of truth. It lives at [`design/badger3000v2.pen`](../../design/badger3000v2.pen), authored in the **pen.dev** canvas app. Code implements the `.pen`; when something needs to change, change the `.pen` first, then port it. This runbook is how a developer (or an agent) turns that file into Astro code without guessing.

## What's in the file

Top-level frames (read them on the canvas, or by node id):

- **Design Tokens** (`Jy3WM`) — the two-tier token system: primitives (`--p-*`, `--g-*`) → semantic (`--a-*`), with LIGHT / DARK / FOREST columns. This is `packages/tokens/tokens.css` verbatim.
- **Components — Library** (`NTO2U`) — 20 reusable masters with their variants. These are `packages/ui/*`.
- **Screens** — Home (`l7yp4`), Conversation (`PuDys`), Response Cards (`x55Spn`), the Browse views (Projects `uXl4B`, Articles `Wmn35`, Experiments, Skills, Testimonials, Bookmarks, Golf, Experience), Mobile Home/Browse/Menu, and dark + forest variants.
- **Chat Architecture** (`xIXxz`) — the `/api/chat` flow ([ADR 0008](../adr/0008-agent-chat-grounded-no-vendor-key.md)).

## The `context` field is the spec

Every meaningful node carries a `context` string — the codegen contract. Read it before implementing:

- **Component master**: `<tag> · <ComponentName> — props` e.g. `button · Button — props: variant(primary|secondary|ghost), icon?, label`.
- **Data slot**: the Sanity binding, e.g. `← project.title`, `fill ← skill.badgeColor`, `tr · GolfRow ← golfScore{course,date,score}`.
- **Screen frame**: the semantic element, e.g. `main`, `aside · site navigation`, `nav · explore`, `section[aria-live=polite] · chat log`, `form · POST /api/chat`, `ul · card grid`.

So a node's name + `context` + geometry + fills give you the component name, its props, its HTML element, and the exact Sanity field each piece binds to.

## Component → file map

| pen master (id) | package file |
| --- | --- |
| Button `CTvHL`, Tag `rw7Gc`, CountBadge `e4RkB0`, ShieldsBadge `NjGub` | `packages/ui/Button.astro`, `Tag.astro`, … |
| Avatar `Xu2VY`, AvatarUser `kF8ut`, Input `WIcVr`, IconButton `HFjfa`, FilterChip `RA61q`, SuggestionChip `TPq9Z` | `packages/ui/*` |
| NavItem `LDNXV`, StatTile `Saf7N`, MessageBubble `x5CCM`, AgentMessage `CVVRV`, Card `I2gPrr`, ProjectCard `FE7oC` | `packages/ui/*` |
| Sidebar `pL9CR`, TopBar `r30jlq`, PageHeader `a1JCtb`, Composer `c2P43y` | `packages/ui/*` (organisms) |

Still to extract (build directly in code against real data): ArticleCard, PenCard, TestimonialCard, SkillBadge group, TimelineEntry, BookmarkFolder+row, GolfBarChart+row, and the mobile organisms (MobileTopBar, MobileTabBar, Drawer).

## The loop

1. **Pick** a component on the canvas (or a screen region).
2. **Read** its node data — name, `context`, size, fills, child structure. In the pen.dev MCP, `Get(id, {depth: n})` returns schema data; `Get(id, {resolveVariables:true})` resolves tokens to values; a screenshot (`TakeScreenshot([id])`) is the pixel target.
3. **Implement** in `packages/ui` as an `.astro` (static) or `.tsx` island (if it has state/events). Use the semantic tag from `context`; take props from `context`; style with `var(--a-*)` tokens — never hardcode colors.
4. **Bind data**: for data templates, each slot's `← field` is the GROQ projection. Query lives in `packages/sanity`.
5. **Verify**: render the page, compare to the pen screenshot. Themes come free — set `data-theme` on `<html>` and light/dark/forest all resolve from the tokens.

## Extracting assets

- **Tokens**: already ported to `tokens.css`; regenerate from the Design Tokens board if values change.
- **Images / SVG**: AI/stock fills and generated SVGs in the pen can be exported; static assets live in `apps/web/public`.
- **Whole-frame reference**: `Export([frameId], "html-css", "...")` or `"png"` from the pen gives a static reference to diff against — use it to check, not to ship (ship the token-driven components).

## Rules

- **Tokens only** — components read `var(--a-*)`; a new skin is one more `[data-theme]` block, zero component edits.
- **Semantic HTML** — honor the `context` tag (`main`/`aside`/`nav`/`article`/`form`) for SEO + a11y.
- **Design first** — if the UI must change, update `design/badger3000v2.pen`, then the component. The file and the code stay in lockstep.

## Links

affects:: [[repo/badger3000]]
uses:: [[tech/astro]] [[tech/sanity]]
