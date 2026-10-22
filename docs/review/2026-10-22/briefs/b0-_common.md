# B0 build — rules for both lanes

You are one of two build agents fixing the urgent issues found in the 2026-10-22 review, in parallel. The coordinator merges your branch into `astro-dev`.

Read first: `CLAUDE.md`, `docs/review/2026-10-22/README.md`, and the lane report(s) named in your brief. Each finding there has a file:line and a proposed fix. Use them, but verify against the code: line numbers may have drifted.

## Where you work

- You run in your **own git worktree** on your own branch (see your brief). Never touch the main checkout at `/Users/badger3g/Code/badger3000` or other branches.
- Setup (once): `cd apps/web && ln -sf /Users/badger3g/Code/badger3000/apps/web/.env .env && npm ci`. npm stays for now (the pnpm move is a later step). If npm asks about `allowScripts`, the approved list is already in `apps/web/package.json`.
- Dev server: run it on **your** port only (`npm run dev -- --port <port>`, see your brief), in the background, and stop it when you are done. Port 4322 belongs to the owner. Don't touch it.
- Stay inside your file list. If you must edit a file owned by the other lane, don't. Write the needed change under "Handoff" in your final message instead.

## Rules

- Never print secrets. Refer to `SANITY_API_TOKEN` by name. To check for a leak, use `grep -rlF "$SANITY_API_TOKEN" dist` (file names only) after sourcing `.env` inside a subshell.
- Keep to the codebase style: comment density and voice like the surrounding code, vanilla TS islands, `var(--a-*)` tokens only, no new frameworks. Add a dependency only if your brief allows it.
- For Astro and Cloudflare adapter APIs, check the installed versions' docs and types in `apps/web/node_modules` (`astro`, `@astrojs/cloudflare`) before relying on memory. Astro 7 and adapter 14 differ from older docs.
- Commit in small logical commits on your branch, each one green (`npm run check && npm run build` in `apps/web`). Use conventional messages like the repo history (`fix(chat): …`, `fix(web): …`). End every commit message with:

  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  ```

- **No push, no deploy, no `wrangler secret`, no PRs.** Don't rotate tokens. Those are the owner's.

## Response contract between the lanes (`POST /api/chat`)

Both lanes code against this. The server lane implements it; the client lane renders it.

| status | body | meaning |
|---|---|---|
| 200 | `{ intent, text, cards, suggestions?, composed }` | unchanged |
| 503 | `{ intent, text, cards: [], composed: "template", degraded: true }` | content source failed; `text` is visitor-facing and safe to show |
| 429 | `{ error: string }` + `Retry-After` header | rate limited |
| 400 / 413 / 405 | `{ error: string }` | bad input / too large / not POST |

Every response is JSON with `Cache-Control: no-store`, `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`.

## When done

1. `git status` is clean, and `git log --oneline astro-dev..HEAD` lists your commits.
2. Final message: what changed (one line per commit), how you verified it, anything left undone, and any Handoff.
3. Run exactly `cmux wait-for -S <signal from your brief>`, then print `DONE <lane>` and stop.
