---
slug: prd/badger3000-ghin-golf-scores
title: badger3000 — GHIN handicap index & recent scores
status: draft
date: 2026-11-11
---

# GHIN handicap index & recent scores

## Problem

The golf page (`apps/web/src/pages/golf.astro`, schema in `packages/sanity/src/schema/parts/golfScores.js`) is filled in by hand: every round and every handicap change is typed into Sanity Studio. GHIN already holds both, so the site should read them from there.

## Goal

Show Kyle's current handicap index and recent scores on the site without manual entry, using code that lives in this repo (no third-party `ghin` dependency).

## Findings

There is no public GHIN API. The USGA's vendor route (Golfer Product Access) is approval-based and aimed at companies; I found no official developer docs, only third-party write-ups. The unofficial flow below comes from reading [n8io/ghin](https://github.com/n8io/ghin) (MIT, `src/client/`). It is not verified against a live call yet, and the response shapes are the wrapper's, not GHIN's documentation.

### Auth (reverse-engineered from GHIN's web app)

1. `POST https://firebaseinstallations.googleapis.com/v1/projects/ghin-mobile-app/installations` with GHIN's embedded Firebase web app id, `authVersion: FIS_v2`, an `sdkVersion`, a `fid`, and an `x-goog-api-key` header. Returns `authToken.token`.
2. `POST https://api2.ghin.com/api/v1/golfer_login.json` with `{ token: <firebase token>, user: { email_or_ghin, password } }`. Returns `golfer_user.golfer_user_token`, a JWT.
3. Later calls send `Authorization: Bearer <jwt>` and a `source: GHINcom` header. Cache the JWT until its `exp`, then log in again.

### Data calls

All under `https://api2.ghin.com/api/v1`, with query param `source=GHINcom`.

- **Handicap index:** `GET /search_golfer.json?ghin=<number>`; read `golfer.handicap_index`.
- **Recent scores:** `GET /scores.json?golfer_id=<number>`, optionally `limit`, `offset`, `from_date_played`, `to_date_played`, `score_types`. Each score has `played_at`, `adjusted_gross_score`, `course_rating`, `slope_rating`, `differential`, `score_type`, `used`, `number_of_holes`.

The wrapper's README lists score fetching under both "features" and "TODO", so confirm the scores call works before building on it.

## Approach (proposed)

- A small module in this repo: login, token cache, two `fetch` calls, schema validation of the responses. Roughly 100 lines.
- **Server-only.** `GHIN_USERNAME`, `GHIN_PASSWORD` and `GHIN_NUMBER` are `context: "server"` secrets in `env.schema` ([ADR 0010](../adr/0010-public-env-prefix.md)); never `PUBLIC_`. Add them to `.env.example` and declare them in `turbo.json`.
- **Not on page view.** Fetch at build time, or on a schedule that writes into Sanity. A failed fetch must keep the last good values and never fail the build.
- Map the fields onto the existing golf schema and page rather than adding a parallel model.

## Risks

- Unofficial and undocumented; it can break without notice.
- It reuses GHIN's own web-client app id, API key and a browser User-Agent. That may breach USGA/GHIN terms. Read the terms, or ask the USGA about official access, before shipping.
- It uses Kyle's personal GHIN login, so credentials live in secrets only, never in the repo, logs or client bundles.

## Next steps

1. Decide: official USGA access vs the unofficial flow above.
2. Run a throwaway local script (`apps/web/scripts/`) with credentials in `apps/web/.env` to confirm the endpoints and score fields.
3. Decide where the data lives: fetched at build time vs written into Sanity.
4. Map fields onto the golf schema and page.
5. Add the env vars to `env.schema`, `.env.example` and `turbo.json`.
6. Add a `sanity:check`-style verification and a graceful fallback.

## Links

affects:: [[repo/badger3000]]
uses:: [[adr/badger3000-public-env-prefix]]
