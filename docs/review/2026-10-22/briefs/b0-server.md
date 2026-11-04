# B0 lane: server

Read `docs/review/2026-10-22/briefs/b0-_common.md` first. Reports: `content-agent.md` (findings 1, 2, 6, 7, 10, 11, 12, 20), `platform.md` (F2, F18).

- Worktree: `/Users/badger3g/Code/badger3000-wt/b0-server`, branch `fix/b0-server`
- Dev port: **4331**
- Signal: `b0-server`

## Your files

`apps/web/src/lib/sanity/**`, `apps/web/src/pages/api/**`, `apps/web/src/lib/agent/**`, `apps/web/astro.config.mjs`, `apps/web/wrangler.jsonc`, `apps/web/.env.example`, `apps/web/scripts/sanity-check.ts`, `apps/web/src/env.d.ts`, new `apps/web/src/lib/http.ts`. **Not** `apps/web/src/lib/chat.ts` (client lane).

## Tasks, in order

1. **Token never in the bundle (P0).**
   - `SANITY_API_TOKEN` must be read at runtime via `astro:env/server` (`access: "secret"`), never `import.meta.env`.
   - `scripts/sanity-check.ts` runs under plain node and can't import `astro:env`. Split the client so a pure factory (config in, client out; no env reading) is shared, and an Astro-only module wires it from `astro:env`. The script wires it from `process.env`.
   - Remove the wrong `PUBLIC_SANITY_DATASET` default (`"production"`); a missing value must produce the existing MISSING error.
   - Read the `PUBLIC_*` values through `astro:env/client` (or `astro:env/server`) so the schema actually applies.
   - Draft preview only on explicit `SANITY_PREVIEW=drafts` (server, optional), not on token presence.
   - `useCdn` defaults to true for published reads (the CDN works with the token; verified in the review). Fix the comments that say otherwise.
   - Verify: `npm run build`, then the subshell `grep -rlF` from the common brief over `dist` must print nothing. Also check `dist/server/.dev.vars`; if the adapter copies `.env` there, note it in your final message (it's local-only output, but say so).
   - Add `npm run build:verify` (or a `postbuild` step): a small node script that fails if the token value appears anywhere in `dist/` and prints only file names.
2. **Credential-less build guard (platform F2).**
   - When `SANITY_ALLOW_EMPTY=1` and Sanity isn't configured, query helpers return empty results instead of throwing, so `npm run build` succeeds with no `.env`. Without the flag, behaviour is unchanged (fail loudly).
   - Verify: `env -i PATH="$PATH" HOME="$HOME" SANITY_ALLOW_EMPTY=1 npm run build` from a shell with no `.env` loaded. Temporarily move the symlink, then restore it.
3. **`/api/chat` hardening.** Follow the response contract in the common brief.
   - try/catch around classify → retrieve → compose, returning the 503 `degraded` reply. `coalesce` the optional fields in the GROQ (`tech`, `skills`, golf `defined(score)`, names).
   - Body-size cap: `content-length` > 2048 → 413, and enforce the cap on the actual read too. `q` must be a string → 400. Non-POST → 405 with an `Allow: POST` header.
   - `src/lib/http.ts`: a `json(body, init)` helper that sets the security headers. Use it in every `src/pages/api/*.ts`.
4. **Rate limit.**
   - Add a Workers Rate Limiting binding `CHAT_LIMITER` (20/60 s, keyed on `cf-connecting-ip`) in `wrangler.jsonc`, read through the adapter's runtime env (check how adapter 14 exposes bindings).
   - When the binding is missing (e.g. `astro dev`), skip limiting. Return 429 with `Retry-After: 60`.
5. **`compose.ts` timeout.** Clear the timer in `finally`. Pass an abort signal to `ai.run` if the binding supports it. Lower the timeout to about 2.5 s.
6. **`CHAT_MODEL_TIER`** → `access: "secret"`, so it's read at runtime.

Out of scope (later steps): intent regex scoring, retrieval with the visitor's terms, the count mismatch, grounding-check rewrite, hoisting the queries, typegen.

## Verify

- `npm run check && npm run build` pass, and the token grep is empty.
- Dev server on 4331. Use curl:
  - a normal question returns 200 JSON;
  - a 3 KB body returns 413;
  - `{"q":{"a":1}}` returns 400;
  - GET returns 405 JSON;
  - with the Sanity project id temporarily broken (shell env override, not by editing `.env`), the reply is 503 JSON with `degraded: true`.
- `npm run sanity:check -- --parse` still works.
