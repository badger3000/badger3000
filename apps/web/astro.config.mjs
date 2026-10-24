// @ts-check
import { defineConfig, envField } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

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
 *
 * **One URL per page:** `https://www.badger3000.com/projects` — the www host and
 * no trailing slash, which is what the live site, Search Console and every
 * internal link already use. `site` is the single source: canonicals, OG URLs,
 * the feeds and the sitemap all read it. `trailingSlash: "never"` with
 * `build.format: "file"` writes `projects.html`, which Workers Static Assets
 * (`html_handling: "auto-trailing-slash"`, see wrangler.jsonc) serves at
 * `/projects` and redirects `/projects/` to.
 */
export default defineConfig({
  site: "https://www.badger3000.com",
  trailingSlash: "never",
  // The AI binding has no local simulator, so the adapter's default workerd
  // prerender opens an authenticated remote proxy during every build. Static
  // pages do not use Workers bindings; only /api/chat and /api/contact do,
  // and both opt out of prerendering. Use Astro's Node prerender so CI stays
  // credential-less; the deployed Worker still runs on workerd.
  adapter: cloudflare({ prerenderEnvironment: "node" }),
  integrations: [
    sitemap({
      // Pages only: no error pages, no feeds or API routes.
      filter: (page) => {
        const { pathname } = new URL(page);
        return pathname !== "/404" && !pathname.startsWith("/api/") && !pathname.endsWith(".xml");
      },
    }),
  ],

  /**
   * Astro-native env: `PUBLIC_` is the only prefix exposed to the browser, so
   * it replaces the `NEXT_PUBLIC_` names the Next app used. Values come from
   * `apps/web/.env` (or the shell / CI).
   *
   * The Sanity names are `optional` so `astro check` and a credential-less build
   * (`SANITY_ALLOW_EMPTY=1`) still work; otherwise `src/lib/sanity/client.ts`
   * throws a message naming the missing key on first use. See
   * docs/adr/0010-public-env-prefix.md.
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
      // "1" lets a build with no credentials (CI) render empty pages instead of
      // failing. Deploy builds never set it. Read at build time, so `public`.
      SANITY_ALLOW_EMPTY: envField.enum({ context: "server", access: "public", values: ["0", "1"], default: "0" }),
      /**
       * The Workers AI "compose" tier, per ADR 0008. **Off by default**, which
       * is a change of mind from the ADR and worth saying out loud: measured
       * against the live catalog, a 3B model could not produce a single grounded
       * line — it decorated every answer ("partnered with Headspace to promote
       * mindfulness", "an 8-round stretch") and every one was caught and thrown
       * away. So the deterministic phrasing is the real answer path, the model
       * is opt-in, and the grounding check below stays as the safety net if you
       * switch it on or move to a larger model.
       *
       * `secret` so it is read at runtime, not inlined at build: flip it with a
       * Worker var or `wrangler secret put`, no rebuild.
       */
      CHAT_MODEL_TIER: envField.enum({
        context: "server",
        access: "secret",
        values: ["off", "on"],
        default: "off",
      }),

      /**
       * `/api/contact` (parity with the Next route, PR #215). All `secret`: read
       * on the Worker at request time with `wrangler secret put`, never baked
       * into a build. Optional so builds work without them; the endpoint
       * answers 503 until every required one is set.
       */
      RESEND_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      RECAPTCHA_SECRET_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      // Where messages are delivered.
      OWNER_EMAIL: envField.string({ context: "server", access: "secret", optional: true }),
      // The verified Resend sender, e.g. `Badger3000 <contact@badger3000.com>`.
      CONTACT_FORM_EMAIL: envField.string({ context: "server", access: "secret", optional: true }),
      // reCAPTCHA v3 score floor, 0–1. Unset → 0.5, as in the Next route.
      RECAPTCHA_MIN_SCORE: envField.number({ context: "server", access: "secret", optional: true }),
    },
  },
  build: {
    // `projects.html`, not `projects/index.html`: with `trailingSlash: "never"`
    // Astro's own links, `Astro.url` and the sitemap all drop the slash.
    format: "file",
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});