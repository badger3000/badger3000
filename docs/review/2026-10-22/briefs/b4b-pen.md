# B4b lane: pen corrections

You edit **`design/badger3000v2.pen`** through the **pencil MCP only** (`get_app_state` first, then `execute`; read the pencil skill with `read_skill` before editing). Never open the `.pen` with Read, Grep or an editor: it's encrypted. The owner approved these corrections on 2026-10-23.

- Work in the main checkout `/Users/badger3g/Code/badger3000`, because the Pen app has that file open. **Edit nothing but the `.pen` file**, and run no git commands: the coordinator commits. The owner may have unsaved or uncommitted pen edits, so change only the nodes listed below and leave everything else as it is.
- Signal: `b4b-pen`
- Reports: **`design.md` §C (P-1…P-9)** and findings 27–29. Also read the final reports' "Pen" sections, which are in the git log messages of the B2/B3 merges (`git log --format=%B astro-dev -40 | less` is fine to read).

## Rule

**The code and schema win.** Where an owner question is still open, make the pen match what the code does today and note it.

## Corrections, in order

1. **P-9 tokens board** (`Jy3WM`):
   - Add `a-on-accent`, `a-ok`, `a-badge-key`, `a-on-cover`, `a-on-cover-muted`, `a-cover-overlay`, `a-cover-window`, `a-scrim`, `a-code-*`, `a-subtle` and `a-accent-text`, plus the cover primitives (`p-cover-1…6-from/to`) and tints (`p-tint-1…8`).
   - Copy the exact values per theme from `packages/tokens/tokens.css`.
   - Replace hardcoded `#FFFFFF` on accent fills with `$a-on-accent`, and `#3BBE7A` with `$a-ok`.
2. **P-1:** re-create a reusable **Footer** master and swap the local Footer frames for refs. Its copy uses `$af-ui`, and the socials are text links. Then delete the 19 v1 variables listed in §C once nothing uses them.
3. **P-2 and P-3:**
   - `FE7oC` ProjectCard context: excerpt = `project_description[0]` text. Remove `tech[]` and `webUrl`.
   - `f3kriq` FeatureCard: auto layout, radius 14, the year stamp bottom-left, the monogram bound to `title[0]`, and the cover `fill ← gradientFor(_id)`. Match the shipped FeatureCard in `packages/ui/src/FeatureCard.astro`.
4. **P-4:** remove `Filters` from the PageHeader master (`a1JCtb`) and update its context. Filters are a separate FilterBar.
5. **P-5:** promote TimelineEntry, TestimonialCard and BookmarkFolder (with its row) to reusable masters, matching the code components. Leave GolfRow and GolfBarChart local.
6. **P-6, P-7, detail screens `I4mvDB` and `vKVLC`** (owner decisions):
   - The tags row shows the **topic only**.
   - "View on CodePen" is the **primary** Button, not ink.
   - Code blocks use the `$a-code-*` tokens.
   - Fix the clipping and related-card height (findings 27–29).
   - Drop the invented bindings: tech block, heart, fork count, "412 hearts".
   - Add a `context` to every slot as in §D.
7. **P-8 golf** (`oH8H5`): the code ships **3** StatTiles and no diff column, so remove the 4th tile and the diff column (the owner question stays open).

## Checks

- After each correction, take `get_screenshot` of the changed frames before and after. Keep them in your scratch dir.
- At the end, run `GetVariables()` and diff the `--a-*`, `--p-*` and `--g-*` names and values against `packages/tokens/tokens.css`. List any mismatch.
- Make sure the Pen app has **saved** the file to disk: its modified time changes. Check with `stat` (that's allowed).

## Final message

One line per correction with the node ids touched, the token diff result, anything skipped and why, and the owner questions that still affect the pen. Then run exactly `cmux wait-for -S b4b-pen`, print `DONE b4b-pen`, and stop.
