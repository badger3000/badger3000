// @ts-check
import { defineConfig } from "astro/config";

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