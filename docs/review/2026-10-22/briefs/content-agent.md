# Lane: content-agent

Read `docs/review/2026-10-22/briefs/_common.md` first. Lane name for the report and signal: `content-agent`.

## Scope

1. **Schema ↔ types ↔ queries.** `schemas/**` (root) vs `apps/web/src/lib/sanity/types.ts` vs `queries.ts` vs the inline GROQ in `lib/agent/retrieve.ts`. Find fields queried that the schema doesn't define, fields typed non-null that the schema allows empty, duplicated projections, and drift with root `lib/sanity.ts` / `types/sanity.ts`. Run `cd apps/web && npm run sanity:check -- --parse` (read-only) if useful.
2. **Typegen.** Evaluate `sanity typegen` (schema extract → generated types for every `defineQuery`) for this repo: what it takes given the schemas are JS/JSX, and whether to adopt it in `packages/sanity`.
3. **Secrets & env.** Confirm seed #1 (check `apps/web/dist` if it exists — never print the value, report only file names). Review `astro.config.mjs` `env.schema` vs real usage, the `PUBLIC_SANITY_DATASET` default vs `.env.example`, `PUBLIC_SANITY_USE_CDN` with a private dataset, draft/perspective handling, how the Worker should get the token at runtime (`astro:env/server` vs `cloudflare:workers` env, wrangler secrets).
4. **Agent pipeline.** `pages/api/chat.ts`, `lib/agent/intents.ts`, `retrieve.ts`, `compose.ts`: error paths (always JSON?), null safety, intent coverage vs the PRD intents list, the grounding check quality (`compose.ts` ALLOWED list, stem matching), timeout handling (`Promise.race` leak), request limits, abuse/rate limiting (Cloudflare options), caching Sanity reads per isolate, no-JS form post response.
5. **Studio.** What it takes to run Studio as `apps/studio` (`sanity.config.ts`, `sanity.cli.ts`, `schemas/structure/*`, `hero.jsx`), and hosting choice (`sanity deploy` vs Cloudflare) with trade-offs.

## Proposal must include

- The `packages/sanity` API: entry points (`./schema` for Studio, runtime for apps), a `createSanity(config)` factory signature, where queries live (named, `defineQuery`), types source, how `apps/web` wires it from runtime env, how `apps/legacy-next` would consume it (or not).
- A concrete fix list for the agent pipeline in priority order.
