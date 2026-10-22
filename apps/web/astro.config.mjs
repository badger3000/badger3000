// @ts-check
import { defineConfig, envField } from "astro/config";

/**
 * Phase 1 is static output: no adapter, so the build is a plain bundle of HTML
 * + assets and `wrangler deploy` uploads it to a Workers Static Assets worker.
 *
 * When /api/chat lands (PRD phase 4) come back here and:
 *   1. npm i @astrojs/cloudflare wrangler   (adapter v14 wants wrangler >= 4.125)
 *   2. import cloudflare from "@astrojs/cloudflare";
 *      adapter: cloudflare(),
 *   3. output: "server"  (or keep "static" and add `export const prerender = false`
 *      on the endpoint routes only, which keeps content pages prerendered)
 *   4. delete the hand-written "assets" block in wrangler.jsonc — the adapter
 *      generates the worker entry and its assets config itself.
 */
export default defineConfig({
  site: "https://badger3000.com",
  trailingSlash: "ignore",

  /**
   * Astro-native env: `PUBLIC_` is the only prefix exposed to the browser, so
   * it replaces the `NEXT_PUBLIC_` names the Next app used. Values come from
   * `apps/web/.env` (or the shell / CI).
   *
   * All four are `optional` so `astro check` and a credential-less build still
   * work; `src/lib/sanity/client.ts` throws a message naming the missing key on
   * first use instead. See docs/adr/0010-public-env-prefix.md.
   */
  env: {
    schema: {
      PUBLIC_SANITY_PROJECT_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_SANITY_DATASET: envField.string({ context: "client", access: "public", optional: true, default: "production" }),
      PUBLIC_SANITY_API_VERSION: envField.string({ context: "client", access: "public", default: "2024-03-09" }),
      // Server-only: draft preview locally. Never shipped, and not needed for
      // a published-content build.
      SANITY_API_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
  build: {
    // Matches wrangler's html_handling: "auto-trailing-slash" — /about and
    // /about/ both serve dist/about/index.html.
    format: "directory",
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});