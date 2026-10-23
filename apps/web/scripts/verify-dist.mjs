#!/usr/bin/env node
/**
 * verify-dist — fail the build if a secret's value ended up in dist/.
 *
 *   pnpm run build:verify   # also runs as `postbuild`
 *
 * `SANITY_API_TOKEN` must only ever be read at runtime (`astro:env/server`,
 * `access: "secret"`). Read it through `import.meta.env` instead and Vite
 * inlines the value into the Worker chunk, which then ships with every deploy.
 * This is the check that would have caught that.
 *
 * Only file names are printed, never values. With no token in the environment
 * (a credential-less CI build) there is nothing to look for, and it says so.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const SECRETS = ["SANITY_API_TOKEN"];
const DIST = "dist";

/**
 * The Cloudflare Vite plugin writes the local env, token included, to
 * `dist/server/.dev.vars` so `wrangler dev` / `vite preview` can run the built
 * Worker. It is local output: listed in `.assetsignore` and not uploaded by
 * `wrangler deploy`. Reported, not failed on — every local build would fail.
 */
const LOCAL_ONLY = new Set([".dev.vars"]);

// Same files Astro reads; the shell wins over them.
for (const file of [".env", ".env.local", ".env.production"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // Absent or unreadable: then the shell is the only source.
  }
}

const needles = SECRETS.map((name) => [name, process.env[name]]).filter(([, value]) => value && value.length >= 8);
if (!needles.length) {
  console.log(`verify-dist: no ${SECRETS.join("/")} in the environment, nothing to look for.`);
  process.exit(0);
}

/** Every file under `dir`, dotfiles included. */
function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (entry.isFile()) yield path;
  }
}

const leaks = [];
const local = [];
for (const path of walk(DIST)) {
  const content = readFileSync(path);
  for (const [name, value] of needles) {
    if (!content.includes(value)) continue;
    (LOCAL_ONLY.has(path.split(/[\\/]/).pop()) ? local : leaks).push(`${relative(".", path)} (${name})`);
  }
}

if (local.length) console.log(`verify-dist: local-only files hold a secret (not deployed):\n  ${local.join("\n  ")}`);
if (leaks.length) {
  console.error(`verify-dist: secret value found in build output:\n  ${leaks.join("\n  ")}`);
  console.error("Read secrets through astro:env/server, never import.meta.env.");
  process.exit(1);
}
console.log(`verify-dist: ${needles.map(([name]) => name).join(", ")} not in ${DIST}/.`);
