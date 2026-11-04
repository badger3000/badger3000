# B2 build — rules for both lanes

You are one of two build agents creating the shared packages, in parallel. The coordinator merges both branches into `astro-dev` and resolves the lockfile and `apps/web/package.json` conflicts. Expect that; don't work around it.

Read first: `CLAUDE.md`, `docs/review/2026-10-22/README.md` (backlog rows B2a/B2b), and the lane report named in your brief. Every finding there has a file:line and a proposed fix. Use them, but verify against the code: B0 and B1 changed a lot since the review (paths are now `apps/web`, `apps/legacy-next`, `packages/*`).

## Where you work

- Your own git worktree on your own branch (see your brief), cut from `astro-dev` after the briefs commit. Never touch the owner's checkout at `/Users/badger3g/Code/badger3000` (dev server on 4322) or other branches/worktrees. Never `rm -rf` outside your worktree.
- Setup (once, from the worktree root):
  ```bash
  ln -s /Users/badger3g/Code/badger3000/apps/web/.env apps/web/.env
  ln -s ../web/.env apps/legacy-next/.env.local
  nvm use && pnpm install --frozen-lockfile
  ```
  Both links are git-ignored; check with `git check-ignore -v` and never commit them. Don't edit `.env` files.
- Dev server: only on **your** port (see your brief), in the background; stop it when done.
- **Stay inside your file list.** If you need a change in the other lane's files, don't make it: write it under "Handoff" in your final message.

## The contract between the lanes

- The sanity lane keeps the **public API of `apps/web/src/lib/sanity/`** stable: `queries.ts` keeps its exported function names and signatures, and `types.ts` keeps its exported type names (it may become re-exports/aliases of generated types). Components and pages import from there and are the ui lane's files.
- Typegen makes many fields `| null`. The ui lane: new `packages/ui` props are plain values (no Sanity types), and call sites in pages pass `field ?? undefined`, so they compile against either shape.
- `apps/web/package.json`: each lane may add **dependencies** only (its own workspace package, plus anything its brief allows). Don't touch scripts there unless your brief says so.
- `CLAUDE.md`, `docs/**` (other than your own package `README.md`), `turbo.json` (sanity lane only, see its brief), root `package.json`: don't edit. Put the doc changes you'd make in your final message under "Docs"; the coordinator applies them after both merges.
- **No pen edits.** Read `design/badger3000v2.pen` through the pencil MCP (`get_app_state`, then `execute`) as needed. Pen corrections (P-1…P-9, new tokens on the board) wait for the owner's OK in B4: list what the pen needs under "Pen" in your final message.

## Rules

- Never print secrets. Refer to `SANITY_API_TOKEN` by name.
- Keep the codebase style: comment density and voice like the surrounding code, vanilla TS islands, `var(--a-*)` tokens only, scoped CSS, no Tailwind or React in `apps/web`/`packages/ui`.
- Workspace packages: `"private": true`, `"type": "module"`, name `@badger3000/<name>`, `exports` map, source shipped as-is (no build step unless unavoidable), consumed as `"workspace:*"`. Give each new package the `check`/`lint`/`typecheck` scripts that make sense so `pnpm turbo run check lint typecheck build` covers it.
- Check the installed versions' docs and types (`node_modules/astro`, `@astrojs/cloudflare`, `sanity`, `@sanity/client`, `groq`, pnpm 11, turbo 2) before relying on memory.
- Small logical commits, each green. Conventional messages like the repo history (`feat(ui): …`, `refactor(web): …`, `feat(sanity): …`). End every commit message with:

  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  ```

- **No push, deploy, `sanity deploy`, `wrangler secret`, PRs or `gh workflow run`.** `wrangler deploy --dry-run` is the only deploy-like command allowed.
- If something needs an owner decision, don't guess: keep current behaviour, and list it in your final message.

## Done means

- `git status` clean; `git log --oneline astro-dev..HEAD` lists your commits.
- From the worktree root, all pass (paste a summary):
  - `pnpm install --frozen-lockfile`
  - `pnpm turbo run check lint typecheck build --filter='!@badger3000/legacy-next'`
  - `SANITY_ALLOW_EMPTY=1 pnpm turbo run check lint typecheck build --filter='!@badger3000/legacy-next' --force` with `apps/web/.env` temporarily moved aside (restore it after)
  - `pnpm --filter @badger3000/legacy-next run lint`, `typecheck`, `build` (restore the regenerated sitemap files afterwards with `git restore`)
  - `pnpm --filter @badger3000/web run sanity:check`
  - `pnpm --filter @badger3000/web run deploy:dry`
  - plus the lane-specific checks in your brief
- Final message: one line per commit, verification results, deviations from the report and why, "Handoff", "Docs", "Pen", and owner questions.
- Then run exactly `cmux wait-for -S <signal from your brief>`, print `DONE <lane>`, and stop.
