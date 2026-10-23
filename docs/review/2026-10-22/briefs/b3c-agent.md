# B3c lane: agent quality

Read `b2-_common.md`, then `b3-_common.md`. Report: **`content-agent.md`** (findings 3, 4, 5, 8, 9, 10, 11, and "Agent pipeline: fix list in priority order" items 5–11). ADR 0008 (`docs/adr/`): the deterministic template phrasing is the real answer path, the model tier stays off by default, and there are no vendor LLM keys.

## Your files

`apps/web/src/lib/agent/**`, `apps/web/src/pages/api/chat.ts`, the existing **chat** queries in `packages/sanity/src/queries/*.ts` (the `…ForChatQuery` exports and the counts; not the browse queries, and not B3a's new `detail.ts`), the typegen outputs, new `apps/web/scripts/agent-check.ts` plus fixtures under `apps/web/scripts/fixtures/`, and an `agent:check` script in `apps/web/package.json`.
**Not:** `lib/chat.ts` and the chat UI components (the response contract stays unchanged), `layouts/**`, the detail pages, the browse queries.

## Tasks, in order

1. **`agent:check` first: a fixture test table, no network.**
   - About 40 example questions with their expected intent, plus canned rows per intent, so the whole pipeline (classify → retrieve with a stubbed fetch → compose → grounding check) runs offline.
   - It must fail loudly.
   - Run it before your changes and record which cases fail, so the report shows before/after.
2. **Intents** (finding 4):
   - Word-boundary matching (`\b` at both ends).
   - Scoring instead of first match.
   - `about` and location terms.
   - "ready" must not route to articles, and "pending" must not route to experiments.
3. **Retrieval with the visitor's terms** (finding 3):
   - The chat queries take a `$q` param: a GROQ `match` on title, topic and tech, falling back to unfiltered results when nothing matches.
   - Strip stopwords and the intent words from `q` first.
   - "react bookmarks" must return React bookmarks, not the first 8 alphabetically. Keep the `$limit` caps.
4. **Counts and phrasing** (finding 5):
   - Counts come after filtering, so the reply text never disagrees with the cards.
   - "Narrowed" templates ("3 of 28 experiments match 'canvas'").
   - A yes/no answer for "does he know X" when skills are asked about.
5. **Grounding check rewrite** (findings 8, 9):
   - Match on whole tokens and numbers, not substrings.
   - Remove the praise words from ALLOWED.
   - Facts are copied verbatim from rows (no invented "worked with him at").
   - Model output that fails falls back to the template.
   - Covered by fixtures, including adversarial ones (invented numbers, invented employers).
6. **Per-isolate memo** (finding 11): a small TTL cache (about 60 s) around the chat's Sanity reads, keyed by query and params. Published perspective only; bypass it for drafts.
7. **Timeout:** verify the B0 abort (about 2.5 s, cleared in `finally`) is still correct after your changes.

Run typegen after query changes, and keep `sanity:check` covering every chat query.

## Lane-specific checks

- `pnpm --filter @badger3000/web run agent:check`: every case passes. List before/after.
- On your dev server, one question per intent plus the review's failing examples ("react bookmarks", "are you ready", "pending experiments", "what does he know about TypeScript"): 200 JSON, sensible cards, and the reply count equals the card count. Record the outputs in your scratch dir.
- The 503, 429, 413, 400 and 405 responses still behave as in B0 (re-run those curls).
- `CHAT_MODEL_TIER` unset: `composed` is `"template"` everywhere.
