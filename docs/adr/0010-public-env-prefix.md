---
slug: adr/badger3000-public-env-prefix
title: badger3000 — one env name set, PUBLIC_ prefix, legacy fallbacks
status: accepted
date: 2026-10-22
---

# One env name set, `PUBLIC_` prefix, legacy fallbacks

## Context

The repo has been through three frameworks, and the env names carry the scars: `NEXT_PUBLIC_SANITY_PROJECT_ID` (29 references), `SANITY_STUDIO_API_PROJECT_ID` (2), plain `SANITY_PROJECT_ID` (2), `SANITY_TOKEN` and `SANITY_API_TOKEN` for the same thing, `SITE_URL` and `NEXT_PUBLIC_SITE_URL` for the same thing, `NEXT_PUBLIC_AUTHOR_NAME` (1). The Astro app in `apps/web` then arrived and needs its own convention: Astro exposes a variable to browser code only when it starts with `PUBLIC_`, so the `NEXT_PUBLIC_` names are meaningless there.

Worse, there was no `.env` file and no `.env.example` in the repo at all, and `apps/web/.gitignore` did not ignore `.env` — the first person to paste a token into `apps/web/.env` would have committed it.

## Decision

**One name set for the repo, `PUBLIC_` for anything browser-visible, no renames that break the live site.**

| was | now | notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `PUBLIC_SANITY_PROJECT_ID` | 29 call sites in the Next app |
| `NEXT_PUBLIC_SANITY_DATASET` | `PUBLIC_SANITY_DATASET` | defaults to `production` |
| `NEXT_PUBLIC_SITE_URL` / `SITE_URL` | `PUBLIC_SITE_URL` | the two spellings are unified on one name |
| `NEXT_PUBLIC_AUTHOR_NAME` | `PUBLIC_AUTHOR_NAME` | RSS feed |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | `PUBLIC_RECAPTCHA_SITE_KEY` | public half of ADR 0003 |
| — | `PUBLIC_SANITY_API_VERSION` | new; pinned so a Sanity API bump cannot change a deployed build |
| `SANITY_API_TOKEN` | unchanged | already correct: server-only |

- **Legacy reads stay.** Every migrated call site reads `PUBLIC_X ?? NEXT_PUBLIC_X` (Sanity Studio keeps `SANITY_STUDIO_API_*` first in its chain, since `sanity` manages those itself). This is what lets the rename land in one commit while Next still serves production — the cutover deletes the fallbacks, not this commit.
- **Astro declares them, typed.** `env.schema` in `astro.config.mjs` lists the four Sanity variables with `envField.string({ context, access })`. All are `optional: true` so `astro check` and a credential-less build still work; `src/lib/sanity/client.ts` throws a message naming the missing key on first use instead, rather than failing at import.
- **`SANITY_API_TOKEN` is optional and server-only.** Drafts are only readable with a token and the CDN never serves them, so "token present" and "read drafts" are one decision, taken in dev only. Production builds read published content over the CDN with no secret at all.
- **Templates are committed, secrets are not.** `.env.example` at the repo root and `apps/web/.env.example` list every name with a comment; both `.gitignore`s now cover `.env.*` with `!.env.example`. This is the part that would have bitten hardest.

## Options rejected

- **Delete the `NEXT_PUBLIC_*` names now** — breaks the live site between this commit and the cutover, and the cutover may slip.
- **Keep both prefixes in the Astro app** — Astro would need `NEXT_PUBLIC_` in its own schema, so the old names outlive the framework that invented them.
- **Keep per-stack env files with no shared names** — two `.env` files to keep in sync and to paste tokens into, for one Sanity project.

## Consequences

- `.env.local` is written once for the repo; `apps/web/.env` holds the same `PUBLIC_*` block (or a symlink) because Astro only loads from its own project directory. *(2026-10-22: since the B1 move the env files are per app, `apps/web/.env` and `apps/legacy-next/.env.local`, with the same names; a symlink between them is fine.)*
- The fallback chains are noisy at ~10 call sites, and they are meant to be temporary: `grep NEXT_PUBLIC_` should go quiet at the cutover, and that grep is the checklist.
- Nothing server-only is prefixed `PUBLIC_`, so `GET /_astro/*.js` cannot leak a token — worth re-checking whenever a secret is added.

## Links

affects:: [[repo/badger3000]]
uses:: [[tech/astro]] [[service/sanity]]
implements:: [[prd/badger3000-astro-conversion]]