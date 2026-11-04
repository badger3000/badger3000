---
slug: adr/badger3000-google-tag-manager
title: badger3000 — Google Tag Manager as a late-loaded bundled script
status: accepted
date: 2026-10-30
---

# Google Tag Manager as a late-loaded bundled script

## Context

The Astro site had no analytics or tag manager. The owner wanted GTM, loaded as efficiently as possible. Constraints: every page is static on Cloudflare Workers assets; `public/_headers` sets a strict CSP (`script-src 'self'` plus one sha256 for the theme-restore script); `<ClientRouter />` makes navigation client-side, so only the first view is a real page load.

## Decision

`PUBLIC_GTM_ID` (build variable, public, optional) feeds `components/Gtm.astro`, rendered in `Base.astro`'s head. It emits a `<meta name="gtm-id">` and imports `lib/gtm.ts`, a bundled module (`'self'`, no new hash). That module:

- sets Consent Mode v2 defaults first (ad signals denied, analytics granted);
- requests `gtm.js` after `window.load`, in `requestIdleCallback` (2–3 s cap), so it never competes with first paint;
- pushes a `virtual_page_view` event on each `astro:page-load` after the first;
- loads nothing when Global Privacy Control or Do Not Track is on.

It renders nothing in `astro dev`, with no id, or with a malformed id. The CSP gains `https://www.googletagmanager.com` (script), `*.google-analytics.com`, `*.analytics.google.com`, `*.googletagmanager.com` (connect) and the GA/GTM hosts (img), on both the site-wide and `/contact` policies.

GTM-side, once: a Custom Event trigger on `virtual_page_view` firing the GA4 `page_view` tag, and GA4's "page changes based on browser history events" turned off (otherwise each navigation counts twice).

## Options rejected

- **The standard inline snippet:** needs a second CSP hash (or `'unsafe-inline'`), and starts the download before first paint.
- **Partytown:** moves GTM into a worker, but needs a proxy for cross-origin requests and breaks tags that read the DOM; the saving is small next to loading after `load`.
- **Cloudflare Zaraz:** loads tools off the main thread with no code, but it needs the site on a proxied custom domain (not workers.dev), injects its own inline script against the CSP, and has weaker single-page-app handling.
- **The `<noscript>` iframe:** would add `frame-src` for visitors without JS, who see almost nothing on this site anyway.
- **Loading on first interaction:** the lightest option, but it drops visitors who never interact, undercounting bounces.

## Consequences

Tags a container adds may need more CSP hosts (an ads or Meta pixel); a blocked one shows as a CSP error. Consent defaults assume no ads and no banner; add a consent platform and change the `default` call if the audience needs one. The Next app in `apps/legacy-next` is frozen and gets no tag.

## Links

affects:: [[repo/badger3000]] [[adr/badger3000-astro-head-csp-fonts]] [[adr/badger3000-public-env-prefix]]
uses:: [[service/cloudflare]]
