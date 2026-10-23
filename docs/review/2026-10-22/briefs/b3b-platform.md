# B3b lane: platform endpoints, SEO, head

Read `b2-_common.md`, then `b3-_common.md`. Reports: **`platform.md`** (parity endpoints, redirects, canonical host) and **`runtime-a11y-seo.md`** (SEO, performance, headers). Decided: the canonical host is **`https://www.badger3000.com`, no trailing slash**; hosting is Cloudflare Workers Builds.

## Your files

`apps/web/astro.config.mjs`, `layouts/Base.astro`, `layouts/AppShell.astro` (props and pass-through only), new `components/Seo.astro`, new `src/lib/seo.ts`, `apps/web/public/**`, new `src/pages/rss.xml.ts`, `src/pages/api/articles-feed.ts`, `src/pages/api/contact.ts`, `src/pages/404.astro`, `src/pages/experience.astro` (print CSS and the `seo` prop only), `src/lib/http.ts`, `wrangler.jsonc`, `apps/web/.env.example`, `turbo.json`, `apps/web/package.json` (you may add `@astrojs/rss`, `@astrojs/sitemap` and `@fontsource*` packages, and remove `lucide-static`), and the root `scripts/update-readme.js` (only if its feed path or host must change).
**Not:** the new detail pages (B3a); `lib/agent/**`, `pages/api/chat.ts`, the chat queries (B3c). You may read `apps/legacy-next/**` for parity, but never edit it.

## Tasks, in order

1. **Canonical host and URLs.**
   - `site: "https://www.badger3000.com"`, and no trailing slash: `trailingSlash: "never"` plus the matching `build.format`.
   - Verify how Workers Static Assets serves the output (`html_handling` in `wrangler.jsonc` and the adapter docs), so `/projects` is 200, `/projects/` 308s to it, and canonicals have no slash.
   - Update `PUBLIC_SITE_URL` in `.env.example`.
2. **`<Seo>`** plus the `seo` prop on `AppShell` → `Base`, per the contract in `b3-_common.md`.
   - Title pattern, description, canonical, OG/Twitter, and `og:image` (default image, plus a per-page override).
   - JSON-LD `Person` on `/`. An RSS `alternate` link.
   - `404` is `noindex` with no canonical.
   - Copy (don't move) the needed `public/` assets from `apps/legacy-next/public` (icons, `manifest.json`, the OG image) and wire the manifest and icons.
3. **RSS:**
   - `/rss.xml` and `/api/articles-feed`, both prerendered.
   - `/api/articles-feed` must keep the shape and fields that `scripts/update-readme.js` and the README workflow read. Diff it against the legacy route's output.
   - Article links point at `/articles/{slug}` (B3a builds those pages).
   - Test `node scripts/update-readme.js` against your built feed, then `git restore README.md`.
4. **Sitemap and robots:**
   - `@astrojs/sitemap`, excluding `/404`.
   - `robots.txt` points at the real sitemap URL on the www host.
5. **Redirects** (`public/_redirects`):
   - `/slidedeck/giga` (from legacy), and `/studio` → `https://badger3000.sanity.studio` 301.
   - Check the Workers docs for whether host redirects (apex → www, http → https) can live in `_redirects`. If they can't, list them as an owner step (a Cloudflare redirect rule).
6. **`/api/contact`** (parity with PR #215, `apps/legacy-next/app/api/contact/route.ts`):
   - reCAPTCHA v3 verify, plus Resend via `fetch` (no SDK).
   - Secrets via `astro:env/server` (`access: "secret"`, declared optional). Use the `json()` helper.
   - Body cap, field validation, 405 with an `Allow: POST` header.
   - A `CONTACT_LIMITER` rate-limit binding next to `CHAT_LIMITER`.
   - Missing config → 503 JSON. **Never send a real email or hit Resend/Google in tests**; test the failure paths with fake values.
   - No form UI this step: whether the Astro site gets a contact form is an owner question.
7. **Headers** (`public/_headers`):
   - Add HSTS and a CSP that allows only what the site uses (self, Sanity image CDN, CodePen iframes, the self-hosted fonts, Workers AI isn't browser-side).
   - Verify in the browser that pages and a CodePen embed load with no CSP console errors.
8. **Self-hosted fonts:**
   - Replace Google Fonts with `@fontsource` packages for the fonts the tokens name (display serif, UI sans, **and the mono**, which is never loaded today).
   - Preload the critical weights, and drop the `fonts.googleapis.com` preconnects.
9. **Print CSS for `/experience`:** it prints as a résumé (legacy parity). Hide the chrome and keep the content.
10. **Small handoffs from B2:**
    - Remove `lucide-static` from `apps/web/package.json` (`packages/ui` owns it).
    - Give `@badger3000/tokens#check` `outputs: []` in `turbo.json`, so Turbo stops warning.

## Lane-specific checks

- `curl -sI` on your dev server and the built preview:
  - `/projects` is 200, `/projects/` redirects, and the canonical href has no slash and uses www;
  - `/rss.xml` and `/api/articles-feed` are valid XML (`xmllint --noout`);
  - the sitemap and `robots.txt` resolve;
  - `/api/contact` returns 405 on GET, 400 for a bad body, and 503 with no config.
- `node scripts/update-readme.js` against your feed updates the README block (then restore it).
- No requests to `fonts.googleapis.com` or `fonts.gstatic.com` in the browser network log. No CSP errors in the console on `/`, `/projects` and a CodePen page (one already exists on `/codepen`).
- `deploy:dry` passes with the new binding.
