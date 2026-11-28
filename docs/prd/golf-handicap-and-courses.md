---
slug: prd/badger3000-golf-handicap-and-courses
title: badger3000 — Golf page: WHS handicap, last 20 rounds, courses
status: active
date: 2026-11-26
---

# Golf page: WHS handicap, last 20 rounds, courses

## Problem

The golf page (`apps/web/src/pages/golf.astro`) lists every round ever logged, charts the last 12 and shows best/average/count. It has no handicap, and a course is only a free-text string on each round, so there is nothing to say about a course.

The pen has been redesigned (`design/badger3000v2.pen`):

| Frame | Id | What it shows |
| --- | --- | --- |
| Browse — Golf | `oH8H5` (main `F43dJ`) | Handicap card + 3 StatTiles, 20-bar chart, "Courses played" cards, "Last 20 rounds" table with an All / Counted filter |
| Browse — Golf · Course drawer | `pe68N` (drawer `hSxF6`) | The same page with a right-hand `CourseDrawer` open |
| Browse — Golf (Dark) | `oAQkk` | Dark copy of `oH8H5` (re-copied in phase 1; replaces `FNKx0`) |

Every node carries a `context` spec (tag · role ← binding). This plan turns those bindings into schema, queries and code. The pen uses sample data (20 rounds at 7 courses).

### What's in Sanity today (checked 2026-11-26, being updated)

The owner is adding more rounds and updating the existing data, so the numbers below are a snapshot. Nothing in the build may assume them.


- **8 rounds**, the newest from 2024-02-17, at 3 courses: `Prescott Golf Club` (6), `Stoneridge Golf Course ` (1, trailing space), `Antelope HIlls GC` (1, typo). The migration normalises the names.
- No rating, slope, tee or differential on any round. Each round needs its differential (from the GHIN app) or its rating and slope before a handicap can be shown.
- At 8 rounds the page would run on the fewer-than-20 rules (below), counting the **2** lowest differentials. The page must handle any count from 0 to 20 and beyond.

## Requirements

1. **Last 20 only.** The page uses the 20 most recent acceptable rounds. Older rounds stay in Sanity and still count towards the nav total. The page-head badge reads `Last 20 of 47`, or `8 rounds` when there are 20 or fewer.
2. **Handicap Index follows the World Handicap System (USGA Rules of Handicapping, 2024 revision)**, exactly as GHIN calculates it. See [Handicap rules](#handicap-rules-whs). Shown in the HandicapCard, to 1 dp, with a trend pill (change since the start of the previous month).
3. **Counted rounds are visible everywhere.** In the chart, table, course cards and drawer, a round used in the index (best 8 of 20, or fewer per Rule 5.2a) is accent-coloured or carries a "Counts" pill. Labels use the live number ("Counts · best 8", "Counted · 2").
4. **All / Counted filter** on the rounds table. Client-side, `aria-pressed` chips, no refetch.
5. **Courses played.** Courses ordered by rounds in the last 20 (ties broken by last played). Each card shows rounds, best, average, last played and how many of its rounds count. All courses played in the last 20 sit in one horizontal scroller (see [Courses row](#courses-row-horizontal-scroller)).
6. **Course drawer.** A course name in the table, or a course card, opens a right-hand drawer, not a page. It holds the photo, name, location/access/holes, description, every tee (yards, rating, slope, times you've played it), your record there (best, average, best differential) and your rounds there, plus "Ask Badger about {course}" and the course website (`ExternalLink`).
7. **Tees.** Every round records the tee played. Course details, including every tee's rating and slope, are entered once on the course. When logging a round in Studio, you pick the course and then one of that course's tees. The rounds table shows a TEE column, and the drawer lists all tees.
8. Tokens only, no React, scoped CSS (CLAUDE.md rules). Works in light/dark/forest.

## Handicap rules (WHS)

Sources: USGA Rules of Handicapping, Rules 5.1–5.9 ([usga.org/handicapping/roh](https://www.usga.org/handicapping/roh/Content/rules/5%202%20Calculation%20of%20a%20Handicap%20Index.htm), [R&A print of Rule 5](https://www.randa.org/roh/the-rules-of-handicapping/rule-5)). There is **no 0.96 multiplier**; that belonged to the pre-2020 USGA system.

**Score differential (Rule 5.1a)** = `(113 / Slope) × (Adjusted Gross Score − Course Rating − PCC)`, rounded to 1 dp.

- *Adjusted gross score* caps every hole at net double bogey, which needs hole scores and a course handicap. We don't store holes.
- *PCC* (playing conditions calculation, −1 to +3) is worked out by GHIN each day from everyone's scores at that course. We can't compute it.

So the page can't reproduce GHIN's differentials from the gross score alone. **Copy each round's differential from the GHIN app** (it's shown on every posted score) into `differential`. Fall back to computing it from the score, rating and slope (PCC 0) only when it's empty, and mark those rounds as estimated.

**9-hole scores (Rule 5.1b, 2024).** The 9-hole differential uses the 9-hole rating and slope, with half the PCC. It is then combined with the **expected 9-hole differential** for the player's Handicap Index on the day played, and the total is rounded to 1 dp. The USGA's example: a 14.0 index and a 9-hole differential of 7.2 give an 18-hole differential of 15.7. The expected-score values come from a USGA table we don't have, so here too: **copy the 18-hole differential GHIN shows** for a 9-hole round. Store `holes: 9` for display only.

**Handicap Index (Rule 5.2)**: the lowest 8 of the most recent 20 differentials, averaged and rounded to 1 dp. With fewer than 20 (Rule 5.2a):

| Scores in record | Differentials used | Adjustment |
| --- | --- | --- |
| < 3 | no index | |
| 3 | lowest 1 | −2.0 |
| 4 | lowest 1 | −1.0 |
| 5 | lowest 1 | 0 |
| 6 | average of lowest 2 | −1.0 |
| 7–8 | average of lowest 2 | 0 |
| 9–11 | average of lowest 3 | 0 |
| 12–14 | average of lowest 4 | 0 |
| 15–16 | average of lowest 5 | 0 |
| 17–18 | average of lowest 6 | 0 |
| 19 | average of lowest 7 | 0 |
| 20 | average of lowest 8 | 0 |

The 3/4/6/19-score rows were confirmed against the USGA rule. Check the rest against [Rule 5.2a](https://www.usga.org/handicapping/roh/Content/rules/5%202a%20For%20Fewer%20Than%2020%20Scores.htm) when building `golf-check.ts` fixtures (the page blocks automated fetches, so read it in a browser).

**Also applies:**

- **Low Handicap Index (5.7):** the lowest index in the 365 days before the most recent round; it only exists once there are 20 scores.
- **Soft cap (5.8):** any rise of more than 3.0 above the Low HI is halved.
- **Hard cap (5.8):** the index can never be more than 5.0 above the Low HI.
- **Exceptional score reduction (5.9):** a differential 7.0–9.9 below the index takes −1.0 off the most recent 20 differentials; 10.0 or more takes −2.0. Reductions add up.
- **Maximum index (5.3):** 54.0.

Timing details: the caps and the Low HI apply only once there are 20 scores, and ESR compares each new differential with the index *before* that round.

Caps and ESR need the index *history*, so `lib/golf.ts` replays every stored round in date order rather than looking only at the last 20.

**Agreement check.** GHIN is the authority. Add an optional `ghinIndex` + `ghinIndexDate` (a `golfProfile` singleton) holding the number from the GHIN app. When it's set and newer than the last round, the card shows it, and `golf-check` warns if the computed index differs by more than 0.1. That usually means a missing round or a differential typed in wrong.

## Content management

### Recommendation: Sanity, entered by hand from the GHIN app

Sanity is already the content layer for the site, the browse queries, typegen, the agent's retrieval and the private-dataset token setup. Golf is a small, structured, owner-edited dataset. After posting a score in GHIN, you add the round in Studio (`badger3000.sanity.studio`, phone-friendly) and copy GHIN's differential.

### GHIN: no feed or API available to us

Checked 2026-11-26. You're right: there's no public GHIN API or feed.

- **Official route:** the USGA **Golfer Product Access (GPA)** program. It gives approved *vendors* (handicap data affiliates, listed on [usga.org](https://www.usga.org/content/usga/home-page/handicapping/world-handicap-system/GPA-Approved-Vendors.html)) API access under a signed agreement, US only, aimed at golf products rather than personal sites. Older reports mention minimums like 10 clubs or 1,400 golfers. A personal portfolio won't qualify; the USGA handicap team (hdcpquestions@usga.org) could confirm.
- **Unofficial route:** the `api2.ghin.com` endpoints the GHIN web app uses, wrapped by projects like [n8io/ghin](https://github.com/n8io/ghin) and [boorad/ghin](https://github.com/boorad/ghin). The [GHIN terms of service](https://www.usga.org/content/usga/home-page/Handicap-ghin/ghin-terms-of-service.html) bar copying, redistributing or offering USGA products as a service, and the flow reuses GHIN's own app keys. **Not recommended**, and dropped from this plan. `docs/prd/ghin-golf-scores.md` should be closed out with this finding.

### New document `golfCourse` (`packages/sanity/src/schema/parts/golfCourse.js`)

Everything about a course lives on one Studio form, entered once. Tees are an array inside the course, so a course and its tees are edited together.

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string, required | "Prescott Golf Club" |
| `facility` | string, optional | Shared name when one club has several courses, e.g. "Antelope Hills Golf Courses". Groups layouts; the drawer lists the others as "also here" |
| `slug` | slug from `name` | drawer id, `data-course` key |
| `location` | string | "Dewey, AZ" |
| `address`, `phone` | string, optional | Not displayed yet |
| `access` | string list: `public` / `private` / `resort` / `municipal` | |
| `holes` | number, 9 or 18 | |
| `par` | number | Course par (a tee can override) |
| `image` | image, hotspot, required `alt`, `credit` | See [Course photos](#course-photos) |
| `description` | portable text (short) | Drawer shows the first block |
| `website` | url | `ExternalLink` in the drawer |
| `tees` | array of `golfTee` objects, at least 1 | See below |
| `scorecard` | array of `{ hole, par, strokeIndex, yardages: { [teeKey]: number } }`, optional | Hole-by-hole card for later; not displayed or used in the maths |

**`golfTee` (object type, inside `tees`):**

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string, required | "Blue", "White", "Combo" |
| `color` | color list (`black` / `blue` / `white` / `gold` / `red` / `green` / `silver` / custom hex) | Drives the swatch. It's content data, so it's allowed outside the token set |
| `gender` | `M` / `F` | Courses rate the same tee separately for men and women; enter the set you play |
| `par` | number, optional | Falls back to the course par |
| `yardage` | number | |
| `rating`, `slope` | number, required | 18-hole Course Rating (e.g. 72.4) and Slope Rating (55–155) |
| `front9Rating`, `front9Slope`, `back9Rating`, `back9Slope` | number, optional | Only needed to estimate 9-hole rounds when GHIN's differential isn't entered |

Each array item keeps its Sanity `_key`. That key is how a round points at "the Blue tees at Prescott" even if the tee is renamed later. Source: the course scorecard or the USGA Course Rating Database.

### Reshape `golfScores`

Only `apps/web` and the standalone Studio (`apps/studio`) matter. The legacy Next app is not kept in step, so breaking changes are fine once the data is migrated.

| Field | Type | Notes |
| --- | --- | --- |
| `course` | reference → `golfCourse`, required | **Replaces** the free-text `course` string (same field name, new type). Phase 2 migrates the data first |
| `tee` | object `{ teeKey, name, color, gender, par, yardage, rating, slope }`, required for new rounds | Set by the **TeePicker** (below). Copies the tee's values at the moment you pick it, so a later re-rating of the course never changes an old round's differential |
| `date` | date | As today |
| `score` | number | Gross score, as today; what the table shows |
| `adjustedScore` | number, optional | GHIN's adjusted gross score (net double bogey), if you want to record it |
| `differential` | number, **expected** | Copied from GHIN. Empty means estimated from `score` and `tee.rating`/`tee.slope` |
| `holes` | 9 or 18, default 18 | For 9 holes, `differential` is GHIN's combined 18-hole value, and `nine` (`front` / `back`) picks the 9-hole rating |
| `scoreType` | `home` / `away` / `competition` | Matches GHIN; display only |
| `excluded` | boolean | Rounds GHIN didn't accept (practice, not posted); kept for the record but left out of the index |

### Entering a round in Studio

The form reads top to bottom: **Course → Tees → Date → Score → Differential**.

1. **Course:** a reference picker. Search by name; "Create new" opens a new `golfCourse` in place, so a first visit to a course doesn't need a separate trip.
2. **Tees:** `TeePicker`, a custom input (`packages/sanity/src/schema/components/TeePicker.jsx`, about 80 lines).
   - It reads the chosen course with `useFormValue(["course"])`, then fetches `*[_id == $id][0].tees` with the Studio's `useClient`. Drafts are included, so a course you just created works straight away.
   - It shows the tees as radio cards: swatch, name, gender, yardage, and rating/slope.
   - Picking one writes the whole `tee` object (with `teeKey`) as a single `set` patch.
   - Before a course is chosen it shows "Pick a course first". If the course has no tees, it links to the course to add them.
   - Changing the course clears `tee`. Validation also fails if `tee.teeKey` isn't one of the course's tees.
   - A small "Refresh from course" button re-copies the values. Use it only if you entered the wrong rating on the course, not when a course is re-rated.
3. **Differential:** the description says "Copy from the GHIN app: Scores → tap the round → Differential". If it's left empty, a read-only hint below shows the estimate `(113 / slope) × (score − rating)`, so a typo stands out.

Other Studio details:

- Preview: `score · course->name · tee.name · date`
- Validation: either `differential` or `tee` is set when `score` is set; `slope` is 55–155
- Course form: validation requires at least one tee, unique tee names per gender, and a rating and slope on every tee
- Rounds migrated without a tee stay valid if they have a `differential`; the owner adds tees for them in phase 3b

*Native-only alternative, if the custom input proves fiddly:* make tees separate `golfTee` documents that reference their course. The round's `tee` then becomes a reference filtered with `options.filter: ({ document }) => ({ filter: "course._ref == $c", params: { c: document.course?._ref } })`. That needs no custom code, but a course's tees are edited on separate documents, and there's no snapshot (re-rating a tee would move old differentials unless you create a new tee document).

### Alternatives considered

| Option | Verdict |
| --- | --- |
| **GHIN API** | No public API; the official GPA program is vendor-only; the unofficial API breaches the ToS. See above. |
| **Astro content collections (JSON/YAML in the repo)** | Simplest, versioned in git, no token. You lose Studio entry from a phone after a round, and the agent's GROQ retrieval would need a second path. Fine for a static course list, worse for rounds. |
| **Cloudflare D1** | Natural only if the Worker logged rounds itself. The site is static-first (ADR 0009); overkill for a few dozen rows a year. |
| **Spreadsheet / Notion / Airtable** | Easy entry, but another vendor token, no typegen, rate limits at build. No gain over Sanity. |

## Course photos

**The owner supplies the photos** (decision 2026-11-26). Wikimedia Commons has no freely licensed photos of the courses played (Prescott Golf Club, StoneRidge, Antelope Hills), and the courses' website photos are copyrighted. The stock images in the pen are placeholders only and are not used on the site.

- Upload to `golfCourse.image` in Studio, with `alt`. Fill `credit` only for photos that aren't yours.
- Landscape, at least 1200 × 520 px (the drawer header is 432 × 180 at 2×; cards crop to 254 × 104 using the hotspot).
- Served through the existing `IMAGE` fragment and Sanity's image CDN, with sizes for the card and the drawer.
- Until a course has a photo, `CourseCard` and the drawer use a token-coloured cover (`gradientFor(slug)` from `@badger3000/tokens/covers`, as project cards do).

## Courses row (horizontal scroller)

Decision (2026-11-26): **side scroll**. Pen: `Courses` in `oH8H5` and `pe68N`.

- `<ul id="courses-track">` with `display: flex; overflow-x: auto; scroll-snap-type: x mandatory`. Each card has `scroll-snap-align: start` and a fixed width of 254px, so the next card peeks at the edge and shows there's more. On mobile the width is about 78vw.
- Native scrolling handles touch, trackpad and shift-wheel. The track is a focusable region (`tabindex="0"`, `role="region"`, `aria-label="Courses played"`), so arrow keys scroll it.
- The section head has two `IconButton`s (chevron-left/right, `aria-controls="courses-track"`). They `scrollBy` one card width, smoothly unless reduced motion is on. Prev is disabled at the start and Next at the end, driven by the `scroll` event. Both are hidden when the track doesn't overflow (for example, 3 courses on desktop).
- Scrollbar: thin, using `scrollbar-color: var(--a-line-2) transparent`.
- Every card is a button that opens the course drawer.
- The head reads `{N} courses · last 20 rounds`; there is no "All N courses" link.

## Target implementation

### Data flow

```
Sanity (golfScores + golfCourse + golfProfile)
  └─ packages/sanity/src/queries/golf.ts   golfPageQuery (one fetch, build time)
       └─ apps/web/src/lib/golf.ts          pure WHS engine + per-course aggregates
            └─ pages/golf.astro             renders everything statically
                 └─ lib/golf-page.ts         vanilla island: filter, drawer, course scroller
```

### Query (`packages/sanity/src/queries/golf.ts`)

`golfPageQuery` returns:

- `rounds`: **every** acceptable round with a score, oldest first: `{ _id, date, score, holes, nine, tee, differential, excluded, "course": course->{ name, "slug": slug.current } }`. `tee` is the snapshot object, so no join on tees is needed. Caps and ESR need the full history; at a few dozen rows a year this is cheap.
- `courses`: `*[_type == "golfCourse"]`, with `{ name, slug, facility, location, access, holes, par, image IMAGE, description, website, tees[]{ _key, name, color, gender, par, yardage, rating, slope } }`
- `profile`: `*[_type == "golfProfile"][0]{ ghinIndex, ghinIndexDate }`

Grouping and the WHS maths stay in TypeScript. Delete `golfScoresQuery` in the same PR that switches the page over. Run `pnpm turbo run typegen --filter=@badger3000/sanity`, then commit `schema.json` and `sanity.types.ts`. Add the projection to `sanity:check`.

### WHS engine (`apps/web/src/lib/golf.ts`)

Pure functions, no Sanity imports:

- `differential(round)`: the stored value, else `round1((113 / tee.slope) × (score − tee.rating))` flagged `estimated`; `null` without a tee (the round shows `—` and can't count)
- `usedCount(n)` / `adjustment(n)`: the Rule 5.2a table as data
- `history(rounds)`: replays rounds in date order. After each round it computes the index (5.2/5.2a) and the Low HI over 365 days (5.7), then applies the soft and hard caps (5.8), ESR (5.9) and the 54.0 maximum (5.3). Returns `{ index, lowIndex, counted: Set<id>, window: rounds[] }` for each date.
- `courseHandicap(round, history)` = `indexOn(round.date) × tee.slope / 113 + (tee.rating − tee.par)` (Rule 6.1), **shown to 1 dp** (owner decision 2026-11-27). Rule 6.1 rounds this to a whole number for play; the page shows the unrounded value. It uses the index in effect on the day played, not today's, and the tee snapshot. A 9-hole round uses half the index and the 9-hole rating, slope and par. It's `null` without a tee, a par, or an index yet (fewer than 3 rounds), and the cell shows `—`. The page falls back to the course par when the snapshot has none, and `TeePicker` now snapshots `tee.par ?? course.par`. Use "Refresh from course" to backfill old rounds
- `current(history)` is the latest index; `trend(history, date)` is the change since a date
- `courseStats(window, counted)` → per course `{ rounds, best, avg, bestDiff, lastPlayed, counting, teesPlayed: Map<teeKey, count> }`. `teesPlayed` drives the drawer's PLAYED column and the highlighted row, sorted rounds desc, then `lastPlayed` desc
- `barHeight(diff, window)`: the chart scale, normalised to the rounds shown

`apps/web/scripts/golf-check.ts` (same style as `agent-check.ts`) runs fixtures for:

- every Rule 5.2a row (0–20 scores)
- ties at the cut-off
- soft cap and hard cap
- ESR −1 and −2
- 9-hole rounds with GHIN differentials
- missing tee
- a tee re-rated on the course after a round (the round keeps its snapshot)

It also compares the computed index with `golfProfile.ghinIndex` when one is set.

### Components

Promote in the pen first (Change the `.pen` first), then port:

| Pen frame (today inline) | Code | Where |
| --- | --- | --- |
| `CourseCard` (`h8P5xH` etc.) | `CourseCard.astro`: props `name, location, image?, cover, rounds, best, avg, lastPlayed, counting` (fixed 254 width set by the track, not the card) | `packages/ui` |
| `Courses` scroller (`XGN3L`) | `CourseStrip.astro`: track + prev/next controls | `apps/web/src/components` |
| `HandicapCard` (`w8ujm`) | `HandicapCard.astro`: props `index, trend, note, source ("ghin" \| "computed")` | `packages/ui` |
| Counts pill | extend `Tag` with `tone="accent"`, or add `CountsPill.astro` | `packages/ui` |
| `ChartCard` (`SmDG7`) | `GolfChart.astro` | `apps/web/src/components` |
| `Table` + `Filter` (`ufeMY`, `l3OmuO`) | `RoundsTable.astro` uses `FilterChip`. Columns: COURSE, TEE (swatch + `tee.name`), DATE, SCORE, DIFF (a `CountsPill` showing the differential when it counts) and COURSE HCP (`courseHandicap`) | `apps/web/src/components` |
| Drawer `tees` (`I2Xcg`) | `TeesTable` section inside `CourseDrawer`: tee, yards, rating, slope, times played; the most-played row is highlighted (`aria-current`) | `apps/web/src/components` |
| Tee swatch | `TeeSwatch.astro`: `color` prop, 1px `--a-line-2` ring so white tees show | `packages/ui` |
| `CourseDrawer` (`hSxF6`) | `CourseDrawer.astro` | `apps/web/src/components` |

### Course drawer behaviour

Follow `MobileDrawer.astro`: a real `<dialog>` with `showModal()`, Esc and a backdrop click to close, focus trapped, `::backdrop` = `--a-scrim`.

- One `<dialog id="course-drawer">` on the page. Each course renders its drawer body once in a `<template data-course-body="{slug}">`. Markup stays in Astro and the island clones it, the same pattern as `lib/chat.ts`. No fetch on open, so it works on the static build.
- The trigger is `<button type="button" aria-haspopup="dialog" aria-controls="course-drawer" data-course="{slug}">` in the course cell and on each CourseCard.
- Right side: `inset-inline-end: 0; height: 100dvh; width: min(480px, 100vw)`. Slide in with `transform` over 240ms, with no motion under `prefers-reduced-motion` (`base.css`). Bar and actions stay pinned; the body scrolls. On a narrow screen it's full width.
- Focus returns to the trigger on close. `aria-labelledby` points at the course `<h2>`.
- Deep link (optional): `?course={slug}` opens it on load, updated with `history.replaceState`.
- Re-initialise on `astro:page-load` (`lib/island.ts`). Delegate clicks at document level (`lib/shell.ts` pattern).

### Filter behaviour

- Rows carry `data-counts="true|false"`. `aria-pressed` on two `FilterChip` buttons; "Counted" sets `[data-filter="counted"]` on the table, and CSS hides `tr[data-counts="false"]`.
- A visually hidden `aria-live="polite"` region announces "Showing N counted rounds".
- Keep `data-item`/`data-search` on the sections so `lib/browse.ts` search still works.

### Empty and partial states

- **Fewer than 3 rounds with differentials:** the HandicapCard shows "Needs N more rounds" with no number.
- **Estimated differentials in the window:** the card note says "Includes N estimated rounds", and the table marks those rounds with `~`.
- **Fewer than 20 rounds:** the chart draws only the rounds there are, at the same bar width (left-aligned).

### Agent chat

- `retrieve.ts` golf case: add facts for the index (`handicap index 12.3, WHS, from the 2 lowest of 8 rounds`) and the counted rounds. Match terms against course names, and change `golfScoresForChatQuery` to read `course->name`.
- `intents.ts` already routes "handicap". Add "course" phrasing such as "where does Kyle play".
- The drawer's "Ask Badger about {course}" links to `/?q=…`.

## Phased plan

| # | Phase | Output | Owner step? |
| --- | --- | --- | --- |
| 1 | Pen | Promote `CourseCard`, `HandicapCard`, the counts pill and `CourseDrawer` to reusable components. Add the "Counted" filter state, the empty state, the photo-less cover, the scroller at its end (Next disabled) and a mobile golf frame. Re-copy the Dark frame from `oH8H5`. | |
| 2 | Migration script | `packages/sanity/scripts/migrate-golf-courses.mjs`: normalise names (trim, fix case/typos via a map), create a `golfCourse` per course, and rewrite each round's `course` from the string to `{ _type: "reference", _ref }`. Dry run by default, `--apply` to write, idempotent. | Run with a write token: owner |
| 3 | Schema + Studio | `golfCourse` with `golfTee` objects, `golfProfile`, `course` as a reference, the `tee` snapshot and `TeePicker`, the other `golfScores` fields, validation. Typegen. Deploy the Studio straight after the migration. | `sanity deploy`: owner |
| 3b | Data entry | Fill in each course with its tees (rating and slope from the scorecard). Then, for each existing round, pick the tee played and copy GHIN's differential. Add the new rounds. Fill in course tees and locations, and upload the photos. Set `ghinIndex`. | Owner |
| 4 | Queries + engine | `golfPageQuery`, `lib/golf.ts`, `golf-check.ts`, `sanity:check` update | |
| 5 | UI | `packages/ui` components, `GolfChart`, `RoundsTable`, `CourseDrawer`, new `golf.astro`, island `lib/golf-page.ts` | |
| 6 | Agent | Handicap and course facts, query and intent updates; `agent-check` fixtures | |

Each phase is its own PR off `master` (`astro-dev` is merged); only `apps/web`, `apps/studio` and `packages/*` change. Order matters once data moves:

1. Run the migration (2).
2. Deploy the Studio (3).
3. Merge the page (4–5) together.

The schema PR changes the existing queries to `coalesce(course->name, course)`, so the current `golf.astro` keeps working before and after the migration. Until 3b is done, the engine has no differentials and the HandicapCard shows the empty state.

## Verification

- `SANITY_ALLOW_EMPTY=1 pnpm turbo run check lint typecheck build --filter='!@badger3000/legacy-next'` (CI)
- `pnpm --filter @badger3000/web run sanity:check`
- `pnpm --filter @badger3000/tokens run check`
- Studio (`pnpm --filter @badger3000/studio run dev`):
  - new round: pick a course and its tees appear; pick a tee and the snapshot is saved
  - changing the course clears the tee
  - a course with no tees shows the link to add them
  - re-rating a tee on the course doesn't change existing rounds
- `golf-check.ts` (all WHS fixtures, plus the GHIN agreement check) and `agent-check.ts` pass
- Manual, in `pnpm --filter @badger3000/web run dev`:
  - the drawer opens from the table and from the cards; Esc, the backdrop and × close it; focus returns to the trigger
  - Tab stays inside the drawer
  - the filter toggles the rows and the live region announces it
  - reduced motion removes the slide
  - light, dark and forest themes
  - 390px width
  - the course scroller: swipe, arrow keys on the focused track, prev/next disabled at the ends, controls hidden when nothing overflows
  - navigating with the ClientRouter re-initialises the island
- Visual check against `oH8H5` and `pe68N` (runbook `designing-from-the-pen.md`)

## Out of scope

- Hole-by-hole scoring, so no adjusted gross score or PCC computed on our side; GHIN's differential covers both
- Any GHIN integration (no public API; see above)
- Separate course pages (the drawer replaces them)
- `apps/legacy-next`: not kept in step (owner decision, 2026-11-26). It only imports the schema for its embedded `/studio`, so CI's legacy lint/typecheck job is unaffected

## Decisions

| # | Question | Decision (2026-11-26) |
| --- | --- | --- |
| 1 | Formula | Official WHS as GHIN calculates it |
| 2 | Source of rounds | Manual entry in Studio, copying GHIN's differential; no GHIN API (none available) |
| 3 | 9-hole rounds | Official rule (expected score, Rule 5.1b), via GHIN's combined differential |
| 4 | More courses than fit | Horizontal scroller with prev/next controls |
| 5 | Course photos | Owner supplies them; token cover until then |
| 6 | Tees | Track the tee for every round. Tees are part of the course form; the round form picks the course, then one of its tees, and keeps a copy of that tee's rating and slope |
| 7 | Multi-course facilities | One `golfCourse` per layout (e.g. Antelope Hills North / South, as GHIN lists them) plus an optional `facility` string; rejected: layouts nested inside one course (two-step TeePicker, stats per facility) |

## Links

affects:: [[repo/badger3000]]
uses:: [[prd/badger3000-ghin-golf-scores]]
uses:: [[adr/badger3000-sanity-content]]
uses:: [[adr/badger3000-static-first-cloudflare-worker]]
uses:: [[adr/badger3000-agent-chat-grounded]]
uses:: [[adr/badger3000-public-env-prefix]]
