// @ts-check
import { defineConfig, envField } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

/**
 * Static-first **with** the Cloudflare adapter (phase 4).
 *
 * Every page is still prerendered; only routes that opt out —
 * `export const prerender = false`, today just `/api/chat` — run on the Worker.
 * The adapter owns `main` and `assets` in wrangler.jsonc, so the hand-written
 * assets block there is gone.
 *
 * Output stays "static" rather than "server" on purpose: content pages keep
 * shipping as immutable edge-cached assets and only the agent endpoint costs an
 * invocation (ADR 0009).
 */
export default defineConfig({
  site: "https://badger3000.com",
  trailingSlash: "ignore",
  adapter: cloudflare(),

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
      // No default: this project's dataset is "badger3000", and a wrong default
      // would silently point at a dataset that does not exist. Missing → the
      // client's MISSING error.
      PUBLIC_SANITY_DATASET: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_SANITY_API_VERSION: envField.string({ context: "client", access: "public", default: "2024-03-09" }),
      // The dataset is private, but the CDN serves it to a request that carries
      // the token, so published reads use it. Draft preview always bypasses it.
      PUBLIC_SANITY_USE_CDN: envField.boolean({ context: "client", access: "public", default: true }),
      // Server-only Viewer token; the dataset is private, so every read needs it.
      // `secret` means it is read at runtime (`wrangler secret put` on the
      // Worker) and never inlined into a bundle.
      SANITY_API_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
      // Draft preview is an explicit opt-in, not implied by having a token.
      // `secret` only so it is read at runtime rather than baked into the build.
      SANITY_PREVIEW: envField.enum({ context: "server", access: "secret", values: ["drafts", "published"], optional: true }),
      /**
       * The Workers AI "compose" tier, per ADR 0008. **Off by default**, which
       * is a change of mind from the ADR and worth saying out loud: measured
       * against the live catalog, a 3B model could not produce a single grounded
       * line — it decorated every answer ("partnered with Headspace to promote
       * mindfulness", "an 8-round stretch") and every one was caught and thrown
       * away. So the deterministic phrasing is the real answer path, the model
       * is opt-in, and the grounding check below stays as the safety net if you
       * switch it on or move to a larger model.
       */
      CHAT_MODEL_TIER: envField.enum({
        context: "server",
        access: "public",
        values: ["off", "on"],
        default: "off",
      }),
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