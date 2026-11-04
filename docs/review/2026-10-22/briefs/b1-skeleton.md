# B1 build — monorepo skeleton

You are the only build agent for this step. The coordinator merges your branch into `astro-dev` when you're done.

- Worktree: `/Users/badger3g/Code/badger3000-wt/b1-skeleton`, branch `chore/monorepo-skeleton` (cut from `astro-dev` at `64f4e8d`)
- Signal when done: `b1-skeleton`

## Read first

`CLAUDE.md`, `docs/review/2026-10-22/README.md`, and **`docs/review/2026-10-22/platform.md` §B1.0–B1.8**. That runbook is your plan; execute it in order, one commit per step, each step green. Also read platform.md §1–§4 and §7: they give the target tree, the drafts of `netlify.toml`, `pnpm-workspace.yaml`, root `package.json`, `turbo.json` and `packages/config`, the scripts triage, and the stale-docs list.

## What changed since platform.md was written (these override it)

1. **PR #215 is already merged into `astro-dev`.** Skip B1.0's `git switch master / pull / merge master`. Start from your branch as-is.
2. **Netlify builds are stopped** (owner decision; the live site stays frozen until cutover).
   - Still write the root `netlify.toml` from §2 (`base = "apps/legacy-next"`), so re-enabling works.
   - Skip every Netlify dashboard step, the branch deploy and the deploy-log check (B1.6's "Green =").
   - B1.6 is green when `pnpm --filter @badger3000/legacy-next run build` succeeds locally.
3. **No push, no PR, no `gh workflow run`.** B1.7's "Green =" becomes: `ci.yml` is valid YAML, and the exact commands it runs succeed locally (`SANITY_ALLOW_EMPTY=1 pnpm turbo run check lint typecheck build --filter='!@badger3000/legacy-next'` and the legacy lint/typecheck job). Test the README script per B1.7 and `git restore README.md` afterwards.
4. **`SANITY_ALLOW_EMPTY` already exists** (B0 server lane): `apps/web` builds without credentials when it is `1`. You don't need to add the F2 guard. Check it still works under pnpm.
5. **Add `@types/node`** as an `apps/web` devDependency in B1.3. Under an isolated pnpm install, `astro check` otherwise reports 11 `process`/`node:fs` errors in `scripts/sanity-check.ts` and `src/lib/sanity/client.ts`.
6. **There is no root `.env.local`.** The Next app gets its Sanity env from the same `PUBLIC_*` names as `apps/web`. After B1.2's move, create an untracked symlink: `ln -s ../web/.env apps/legacy-next/.env.local`. Before B1.2 (the B1.0 baseline), symlink it at the worktree root instead (`ln -s apps/web/.env .env.local`) and remove that link in B1.2. Also `ln -s /Users/badger3g/Code/badger3000/apps/web/.env apps/web/.env` in the worktree first. Make sure neither link is ever committed (`git check-ignore -v` them).
7. **`CLAUDE.md` is already tracked** (no `.gitignore` change needed for it). Its content is stale: rewrite it in B1.8 for the new layout and pnpm commands, keeping its structure and tone. Also correct two things the B0 lane found: `PUBLIC_SANITY_USE_CDN` now defaults to **true** (the CDN works with the token), and draft preview is opt-in via `SANITY_PREVIEW=drafts`.
8. Stale generated `.next/types` reference a removed `app/badger3000` route and make `tsc` fail. B1.2 deletes `.next`, which fixes it. If a baseline typecheck fails only on `.next/types/*`, delete `.next` and re-run; that isn't a real failure.
9. `docs/review/**` is a dated record, so leave it unchanged. Update the living docs per §7 instead.

## Rules

- Work only in your worktree. Never touch `/Users/badger3g/Code/badger3000` (the owner's checkout, which has a dev server running on 4322) or other branches. Never `rm -rf` outside your worktree.
- Never print secrets. Don't edit `.env` files, only symlink them.
- Commits: conventional messages like the repo history (the §B1 runbook has them). End each commit message with:

  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  ```

- If a step can't go green as written (a pnpm/turbo/Next behaviour the runbook didn't foresee), make the smallest fix that keeps the intent, note it in the commit body, and carry on. If it needs an owner decision, stop and say so in your final message.
- Use the installed versions' docs and types (`node_modules/next/dist/docs/`, as `AGENTS.md` says; pnpm 11; turbo 2) rather than memory.

## Done means

- `git status` is clean. `git log --oneline astro-dev..HEAD` shows the B1.1–B1.8 commits.
- From the worktree root, all of these pass (paste a summary of the results):
  - `pnpm install --frozen-lockfile`
  - `SANITY_ALLOW_EMPTY=1 pnpm turbo run check lint typecheck build --filter='!@badger3000/legacy-next'`, run twice; the second run must be a FULL TURBO cache hit
  - `pnpm --filter @badger3000/legacy-next run lint`, `typecheck` and `build` (then restore the sitemap files)
  - `pnpm --filter @badger3000/web run sanity:check -- --parse`
  - `pnpm --filter @badger3000/web run deploy:dry`
- Final message: one line per commit, the verification results, every deviation from platform.md and why, and anything the owner must do (for example, Workers Builds settings at cutover).
- Then run exactly `cmux wait-for -S b1-skeleton`, print `DONE b1-skeleton`, and stop.
