# @badger3000/sanity

Everything that knows the Sanity content model: the Studio schema, every GROQ query the site runs, the types generated from both, and a client factory. Consumed as `"workspace:*"`; source ships as-is (no build step).

| Export | File | For |
|---|---|---|
| `.` | `src/index.ts` | `createSanity(config)`, `imageUrl`, `API_VERSION`, non-secret `projectId`/`dataset`. Depends only on `@sanity/client`; reads no env and holds no state, so each caller passes its own config |
| `./queries` | `src/queries/*.ts` | One file per content type, each query a `defineQuery`. `browseQueries` (pages), `chatQueries` (the agent's retrieval), `queries` (both, for `sanity:check`) |
| `./types` | `src/sanity.types.ts` | **Generated.** Schema types plus one `XQueryResult` per query; `client.fetch(query)` is typed from the query string |
| `./schema` | `src/schema/` | `schemaTypes` for Studio (JS/JSX). Pulls in `sanity` and React, so runtime code never imports it |

## Regenerating the types

After changing the schema or a query:

```bash
pnpm turbo run typegen --filter=@badger3000/sanity
```

That runs `schema:extract` in `apps/studio` (`sanity schema extract --enforce-required-fields` → `schema.json`, so only `Rule.required()` fields are non-null), then `sanity typegen generate` here (config in `sanity.cli.ts`). Commit both `schema.json` and `src/sanity.types.ts`: the tasks sit outside the `build` chain, so CI never needs Studio deps. Re-running with no changes gives no diff.

Typegen only finds queries written with `defineQuery`, and only resolves interpolations it can see statically (`const` fragments like `IMAGE` in `src/queries/fragments.ts`).

## Scripts

`scripts/` holds one-off bookmark data operations; see `scripts/README.md`.
