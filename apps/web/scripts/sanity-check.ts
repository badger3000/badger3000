#!/usr/bin/env node
/**
 * Proves the Sanity wiring end to end: parses every projection in
 * src/lib/sanity/queries.ts with groq-js, and — when credentials are present —
 * fetches each one and prints what came back.
 *
 *   npm run sanity:check             # parse, then fetch if configured
 *   npm run sanity:check -- --parse  # syntax only, no network
 *   npm run sanity:check -- --json   # machine-readable
 *   npm run sanity:check -- projects # only queries whose name matches
 *
 * Relative imports carry their .ts extension so Node can strip the types and run
 * this directly — no loader, no bundler. Astro's tsconfig allows it
 * (`allowImportingTsExtensions`).
 */
import { parse } from "groq-js";
import { queries, querySet } from "../src/lib/sanity/queries.ts";
import { dataset, isConfigured, projectId } from "../src/lib/sanity/client.ts";

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
        "Copy apps/web/.env.example to apps/web/.env, or pass --parse to skip.",
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