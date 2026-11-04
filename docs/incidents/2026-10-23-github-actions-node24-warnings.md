---
slug: incident/badger3000-github-actions-node24-warnings
title: badger3000 — GitHub Actions emitted Node 20 and lint warnings
status: resolved
date: 2026-10-23
---

# GitHub Actions emitted Node 20 and lint warnings

## Summary

GitHub Actions warned that the CI workflow used action releases whose runtime targeted Node.js 20, which is deprecated and was being forced to Node.js 24. It also warned that `ubuntu-latest` would migrate to Ubuntu 26. The legacy Next app's lint task reported warnings for unused values and for App Router route files that export metadata or route configuration alongside their component.

## Cause

The workflows still referenced `actions/checkout@v4`, `actions/setup-node@v4`, `actions/cache@v4`, `pnpm/action-setup@v4` and `peter-evans/create-pull-request@v7`, whose action runtimes use Node 20. They also used the moving `ubuntu-latest` label.

The Fast Refresh lint rule assumes a React component file exports only components. Next.js App Router route files intentionally export framework values such as `metadata`, `viewport`, `generateMetadata`, `generateStaticParams`, `dynamic` and `revalidate`, so the rule does not apply cleanly to those files.

## Fix

- Both workflows now pin `ubuntu-24.04` instead of the moving `ubuntu-latest` label.
- Actions now use their Node 24 releases: Checkout v7, Setup Node v7, Cache v6, pnpm Action Setup v6 and Create Pull Request v8.
- The Fast Refresh rule is disabled only for `app/**/page.tsx` and `app/**/layout.tsx`, where Next.js requires the additional framework exports.
- Unused imports and map indexes were removed, the unused `ArticlesFilter` children prop was deleted, and the header's internal link now uses `next/link`.
- The dynamic badge images remain plain `<img>` elements with a targeted lint exception; their hosts are data-driven and cannot use `next/image` without an unrestricted remote-image policy.

## Verification

- `pnpm --filter @badger3000/legacy-next run lint` — passed with zero warnings.
- `pnpm --filter @badger3000/legacy-next run typecheck` — passed.
- `pnpm turbo run check lint typecheck build --filter='!@badger3000/legacy-next'` — 8 tasks passed.
- `pnpm turbo run lint typecheck --filter=@badger3000/legacy-next` — 2 tasks passed.
- Both workflow files parse as valid YAML.

## Links

affects:: [[repo/badger3000]]
uses:: [[tech/nextjs]]
