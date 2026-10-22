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
- **Screens** — Home (`l7yp4`), Conversation (`PuDys`), Response Cards (`x55Spn`), the Browse views (Projects `uXl4B`, Articles `Wmn35`, Experiments `fDntQ`, Skills `NH0XZ`, Testimonials `xTK4z`, Bookmarks `fjLXc`, Golf `oH8H5`, Experience `QTqA7`), the **detail views** for articles and experiments (`I4mvDB` and `vKVLC`), Mobile Home / Browse / Menu, and the dark + forest variants for the major screens.
- **Chat Architecture** (`xIXxz`) — the `/api/chat` flow ([ADR 0008](../adr/0008-agent-chat-grounded-no-vendor-key.md)).

## The `context` field is the spec

Every meaningful node carries a `context` string — the codegen contract. Read it before implementing:

- **Component master**: `<tag> · <ComponentName> — props` e.g. `button · Button — props: variant(primary|secondary|ghost), icon?, label`.
- **Data slot**: the Sanity binding, e.g. `← project.title`, `fill ← skill.badgeColor`, `tr · GolfRow ← golfScore{course,date,score}`.
- **Screen frame**: the semantic element, e.g. `main`, `aside · site navigation`, `nav · explore`, `section[aria-live=polite] · chat log`, `form · POST /api/chat`, `ul · card grid`.

So a node's name + `context` + geometry + fills give you the component name, its props, its HTML element, and the exact Sanity field each piece binds to.

## Component → file map

| pen master (id) | file (as built) |
| --- | --- |
| Button `CTvHL`, Tag `rw7Gc`, CountBadge `e4RkB0`, ShieldsBadge `NjGub` | `apps/web/src/components/Button.astro`, `Tag.astro`, … |
| Avatar `Xu2VY`, AvatarUser `kF8ut`, Input `WIcVr`, IconButton `HFjfa`, FilterChip `RA61q`, SuggestionChip `TPq9Z` | `apps/web/src/components/*` |
| NavItem `LDNXV`, StatTile `Saf7N`, MessageBubble `x5CCM`, AgentMessage `CVVRV`, Card `I2gPrr`, ProjectCard `FE7oC`, FeatureCard `KkR-feature` (`f3kriq` in the file) | `apps/web/src/components/*` |
| Sidebar `pL9CR`, TopBar `r30jlq`, PageHeader `a1JCtb`, Footer `RGuEe` | `apps/web/src/components/*` (organisms) |

**FeatureCard vs ProjectCard.** `ProjectCard` (`FE7oC`) is the compact 4-slot card used in the **detail-screen related rows** (no year/category/tech-row slots). `FeatureCard` (`f3kriq`) is the 8-slot rich card used in the **Browse — Projects grid** (Trailhead, Orbit UI, Fairway, Inkwell, Pulse, Beacon, Loop, Ledger, Mosaic). Each Browse — Projects card is a single `ref: f3kriq` with overrides on the master's named children: `Monogram`, `Year`, `Category`, `Title`, `Desc`, `Tags` (full subtree replacement), `Preview`. Every card overrides `Year.descendants.p83sD.fill: { enabled: false }` so the year stamp floats transparent over the gradient preview. All three themes (Light, Dark, Forest) re-render the same 27 instances automatically from the token table.
| Mobile bar `QIR7a` / `yM5Vm`, drawer `uaeM2`, tab bar `nPhhS` | `MobileTopBar.astro`, `MobileDrawer.astro`, `MobileTabBar.astro` |
| App shell `l7yp4` / `TLAnY` | `apps/web/src/layouts/AppShell.astro` |

Still to build against real data: TestimonialCard, the skill badge group, TimelineEntry, BookmarkFolder + row, GolfBarChart + row, and the Composer (`c2P43y`, needed for `/api/chat` in phase 4).

> **Note on cards.** The browse listings for articles and experiments still use local-frame card layouts (owner of the list frame, not a master) — refactoring them is **not** required for the light/dark/forest themes to resolve. The **detail views** (`I4mvDB`, `vKVLC`) re-use `ProjectCard` (`FE7oC`) for the "More from the journal" / "More in React" related grid with a per-instance gradient/title/desc override. The **Browse — Projects grid** (Trailhead, Orbit UI, Fairway, Inkwell, Pulse, Beacon, Loop, Ledger, Mosaic) is built from the `FeatureCard` (`f3kriq`) master — 27 instances across Light, Dark, and Forest themes, all reading from the same single source.

## The canvas is live; the file on disk may be behind it

The `.pen` is open in the Pen app while you work, so `git` and a plain JSON read of
`design/badger3000v2.pen` can lag behind what is on the canvas — including nodes
that only exist in memory until you save. **Read the design through the pen.dev
MCP (`execute` + `Get`) when you start work on a component**, and treat the file as
the record of what has been committed. As of 2026-10-22 the canvas held a reusable
`Footer` (`RGuEe`) that was not yet in the file.

## The loop

1. **Pick** a component on the canvas (or a screen region).
2. **Read** its node data with the pen.dev MCP (see below), or read the JSON directly.
3. **Implement** in `packages/ui` as an `.astro` (static) or `.tsx` island (if it has state/events). Use the semantic tag from `context`; take props from `context`; style with `var(--a-*)` tokens — never hardcode colors.
4. **Bind data**: for data templates, each slot's `← field` is the GROQ projection. Query lives in `packages/sanity`.
5. **Verify**: render the page, compare against the canvas. Themes come free — set `data-theme` on `<html>` and light/dark/forest all resolve from the tokens.

## The pen.dev MCP (pi)

Configured in `.pi/mcp.json` and `~/.pi/agent/mcp.json` as the stdio server `pencil`:

```
~/.pencil/mcp/visual_studio_code/out/mcp-server-darwin-arm64 --app desktop --agent pi
```

It is a socket client: the **Pen app must be running with the `.pen` file open** or `execute` fails. Check with `pi mcp list`; reload a running session with `/reload`. Tools (exposure `direct`):

| tool | use |
| --- | --- |
| `get_app_state` | active document, selected nodes, top-level frames + ids, reusable components. Call first. |
| `execute` | read/mutate the design as a JS snippet — the real interface. `input` is a snippet; `filePath` optional. On failure it returns an `editId`: patch it with `edits` (`find`/`replace`, `all?`) instead of resending `input`. |
| `read_skill` | the pen.dev canvas skill. `read_skill()` → SKILL.md; `read_skill({path})` for a referenced file such as `execute.md`, `guide/web-app.md`. |
| `get_style` | style archetypes. `get_style()` lists; `{name}` then `{name, params}` loads. |
| `browser` | integrated browser: `load-page`, `import-to-canvas`, `screenshot-to-canvas`, `return-element`, `return-screenshot`. |

Example — read a frame subtree:

```
execute({ filePath: "design/badger3000v2.pen", input: "…" })
```

Add `--enable_spawn_agents` to the args if you ever want the `spawn_agents` tool.

Without the app running you can still read everything straight from the `.pen` JSON (`python3 -c 'import json;…'`) — that path has no dependency on Pencil.

## Extracting assets

- **Tokens**: already ported to `tokens.css`; regenerate from the Design Tokens board if values change.
- **Images / SVG**: AI/stock fills and generated SVGs in the pen can be exported; static assets live in `apps/web/public`.
- **Whole-frame reference**: export a frame to HTML/CSS or PNG from the pen app (or via `execute`) to get a static reference to diff against — use it to check, not to ship (ship the token-driven components).

## Rules

- **Tokens only** — components read `var(--a-*)`; a new skin is one more `[data-theme]` block, zero component edits.
- **Semantic HTML** — honor the `context` tag (`main`/`aside`/`nav`/`article`/`form`) for SEO + a11y.
- **Design first** — if the UI must change, update `design/badger3000v2.pen`, then the component. The file and the code stay in lockstep.

## Links

affects:: [[repo/badger3000]]
uses:: [[tech/astro]] [[tech/sanity]]
