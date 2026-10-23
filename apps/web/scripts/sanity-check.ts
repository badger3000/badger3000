#!/usr/bin/env node
/**
 * Proves the Sanity wiring end to end: parses every projection in
 * src/lib/sanity/queries.ts with groq-js, and — when credentials are present —
 * fetches each one and prints what came back.
 *
 *   pnpm run sanity:check             # parse, then fetch if configured
 *   pnpm run sanity:check -- --parse  # syntax only, no network
 *   pnpm run sanity:check -- --json   # machine-readable
 *   pnpm run sanity:check -- projects # only queries whose name matches
 *
 * Relative imports carry their .ts extension so Node can strip the types and run
 * this directly — no loader, no bundler. Astro's tsconfig allows it
 * (`allowImportingTsExtensions`).
 */
import { parse } from "groq-js";
import type { SanityClient } from "@sanity/client";
import { queries, createQuerySet } from "../src/lib/sanity/queries.ts";
import { createSanityClient, isComplete } from "../src/lib/sanity/factory.ts";

// This app has no @types/node (nothing else needs it), so type the slice of
// `process` this script uses rather than add a dependency for one file.
const { process } = globalThis as unknown as {
  process: {
    argv: string[];
    env: Record<string, string | undefined>;
    exit(code?: number): never;
    loadEnvFile?(path: string): void;
  };
};

// Astro loads .env itself; this script runs under plain node, so load the same
// files by hand. It can't import `astro:env`, so it builds its own client from
// `process.env` with the same pure factory the app uses. Only names are ever
// printed; values are never echoed.
for (const file of [".env", ".env.local", ".env.development"]) {
  try {
    process.loadEnvFile?.(file);
  } catch {
    // Absent, malformed or unreadable: reported below as missing config.
  }
}

const env = process.env;
const config = {
  // The legacy names are still accepted until the Next app is cut over.
  projectId: env.PUBLIC_SANITY_PROJECT_ID ?? env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.PUBLIC_SANITY_DATASET ?? env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.PUBLIC_SANITY_API_VERSION,
  token: env.SANITY_API_TOKEN,
  useCdn: env.PUBLIC_SANITY_USE_CDN !== "false",
  perspective: env.SANITY_PREVIEW === "drafts" ? ("drafts" as const) : ("published" as const),
};
const { projectId, dataset } = config;
const isConfigured = isComplete(config);
let client: SanityClient | undefined;
const querySet = createQuerySet((query) => (client ??= createSanityClient(config)).fetch(query));

type QueryName = keyof typeof querySet;
type Result = { ok: boolean; count?: number; ms?: number; error?: string; parsed?: boolean };

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const parseOnly = args.includes("--parse");
const only = args.filter((a) => !a.startsWith("--"));

const allNames = Object.keys(querySet) as QueryName[];
const names = allNames.filter((name) => !only.length || only.some((o) => name.includes(o)));

const report: Record<string, Result> = {};
const failures: string[] = [];

// 1. Syntax. Cheap, offline, and the check that catches a bad projection before
//    a build does.
for (const name of names) {
  try {
    parse(queries[name]);
    report[name] = { ...(report[name] ?? { ok: true }), parsed: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    report[name] = { ok: false, parsed: false, error: message };
    failures.push(`${name}: GROQ parse failed — ${message.split("\n")[0]}`);
  }
}
if (!asJson && failures.length === 0) console.log(`  ✓ ${names.length} quer${names.length === 1 ? "y" : "ies"} parse`);

// 2. Data. Needs credentials.
if (!parseOnly && failures.length === 0) {
  if (!isConfigured) {
    console.error(
      [
        "Parsed OK, but no Sanity credentials to fetch with:",
        `  PUBLIC_SANITY_PROJECT_ID = ${projectId ?? "(unset)"}`,
        `  PUBLIC_SANITY_DATASET    = ${dataset ?? "(unset)"}`,
        "Set it in apps/web/.env (see .env.example), export it in the shell, or",
        "pass --parse to skip the network check.",
      ].join("\n"),
    );
    process.exit(1);
  }

  console.error(`project ${projectId} · dataset ${dataset}${asJson ? "" : "\n"}`);

  for (const name of names) {
    const started = Date.now();
    try {
      const rows = await querySet[name]();
      const count = Array.isArray(rows) ? rows.length : rows ? 1 : 0;
      report[name] = { ok: true, parsed: true, count, ms: Date.now() - started };
      if (!asJson) {
        const first = rows ? JSON.stringify(rows).slice(0, 92) : "—";
        console.log(`  ✓ ${name.padEnd(13)} ${String(count).padStart(4)} rows  ${first}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report[name] = { ok: false, parsed: true, error: message };
      failures.push(`${name}: ${message.split("\n")[0]}`);
      if (!asJson) console.log(`  ✗ ${name.padEnd(13)} ${message.split("\n")[0]}`);
    }
  }

  // Zero rows is usually a wrong `_type` or the wrong dataset, not empty content.
  for (const [name, result] of Object.entries(report)) {
    if (result.ok && result.count === 0 && name !== "education" && name !== "settings") {
      failures.push(`${name} returned 0 rows — check the dataset name and the _type in schemas/.`);
    }
  }
}

if (asJson) console.log(JSON.stringify({ projectId, dataset, report }, null, 2));

if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
if (parseOnly) console.log(`\n${names.length} quer${names.length === 1 ? "y" : "ies"} parse cleanly.`);