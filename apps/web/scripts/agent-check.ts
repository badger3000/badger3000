#!/usr/bin/env node
/**
 * The agent's test table, offline: every case in fixtures/agent-cases.ts runs
 * the real pipeline (`answer()`: classify → retrieve → compose → template),
 * with Sanity replaced by groq-js evaluating the real chat queries over
 * fixtures/agent-dataset.json, and the model replaced by a stub.
 *
 *   pnpm run agent:check            # every table, exit 1 on any failure
 *   pnpm run agent:check -- golf    # only cases whose question matches
 *
 * Checked on every answer, beyond each case's own expectations: the template
 * tier answers when CHAT_MODEL_TIER is off, and the reply's first number is the
 * number of cards shown (finding #5), for the intents that list things.
 */
import { evaluate, parse } from "groq-js";
import { answer, type ChatResponse } from "../src/lib/agent/answer.ts";
import { isGrounded, type AiBinding } from "../src/lib/agent/compose.ts";
import type { ChatFetch } from "../src/lib/agent/retrieve.ts";
import { memoize } from "../src/lib/agent/memo.ts";
import { cases, grounding, model } from "./fixtures/agent-cases.ts";

const { process } = globalThis as unknown as {
  process: { argv: string[]; exit(code?: number): never };
};

const dataset = (
  await import("./fixtures/agent-dataset.json", { with: { type: "json" } })
).default as Record<string, unknown>[];

/** Sanity, offline: the same GROQ, the same params, fixture documents. */
const fetchFixtures: ChatFetch = async <T>(query: string, params: Record<string, unknown> = {}) => {
  const tree = parse(query, { params });
  return (await (await evaluate(tree, { dataset, params })).get()) as T;
};

const LISTS = new Set(["projects", "articles", "experiments", "experience", "education", "testimonials", "bookmarks"]);

const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const picked = <T extends { q?: string; line?: string }>(rows: T[]) =>
  rows.filter((row) => !only.length || only.some((o) => (row.q ?? row.line ?? "").toLowerCase().includes(o.toLowerCase())));

// compose() logs every line it refuses; the tables below report those.
console.info = () => {};

const failures: string[] = [];
let passed = 0;

function report(label: string, problems: string[]) {
  if (problems.length) {
    failures.push(`${label}\n      ${problems.join("\n      ")}`);
    console.log(`  ✗ ${label}`);
  } else {
    passed++;
    console.log(`  ✓ ${label}`);
  }
}

// 1. Questions → intent, cards and reply.
console.log("questions");
for (const c of picked(cases)) {
  const problems: string[] = [];
  let res: ChatResponse | undefined;
  try {
    res = await answer(c.q, { fetch: fetchFixtures, model: {} });
  } catch (error) {
    problems.push(`threw: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (res) {
    const titles = res.cards.map((card) => card.title);
    if (res.intent !== c.intent) problems.push(`intent ${res.intent}, expected ${c.intent}`);
    if (res.composed !== "template") problems.push(`composed ${res.composed} with the model tier off`);
    for (const title of c.cards ?? []) if (!titles.includes(title)) problems.push(`missing card “${title}”`);
    for (const title of c.without ?? []) if (titles.includes(title)) problems.push(`unexpected card “${title}”`);
    if (c.count !== undefined && titles.length !== c.count) problems.push(`${titles.length} cards, expected ${c.count}`);
    for (const pattern of c.text ?? []) if (!pattern.test(res.text)) problems.push(`text does not match ${pattern}`);
    if (LISTS.has(res.intent) && titles.length) {
      const first = res.text.match(/\d+/)?.[0];
      if (first !== String(titles.length)) problems.push(`text says ${first ?? "no number"} over ${titles.length} cards`);
    }
    if (problems.length) problems.push(`→ ${res.intent}: “${res.text}” [${titles.join(" | ")}]`);
  }
  report(`${c.q}${c.why ? `  (${c.why})` : ""}`, problems);
}

// 2. The grounding check on its own.
console.log("\ngrounding");
for (const g of picked(grounding)) {
  const got = isGrounded(g.line, g.facts);
  report(`${g.grounded ? "pass" : "fail"}: ${g.line}  (${g.why})`, got === g.grounded ? [] : [`isGrounded → ${got}`]);
}

// 3. The model tier, on, with a stub binding: a bad line falls back.
console.log("\nmodel tier");
for (const m of picked(model)) {
  let signal: AbortSignal | undefined;
  const ai: AiBinding = {
    run(_model, _input, options) {
      signal = options?.signal;
      if (m.says === "throw") return Promise.reject(new Error("stub model error"));
      if (m.says === "hang") return new Promise(() => {});
      return Promise.resolve({ response: m.says });
    },
  };
  const problems: string[] = [];
  const started = Date.now();
  const res = await answer(m.q, { fetch: fetchFixtures, model: { tier: "on", ai } });
  if (res.composed !== m.composed) problems.push(`composed ${res.composed}, expected ${m.composed}: “${res.text}”`);
  if (m.says === "hang" && !signal?.aborted) problems.push("the timeout did not abort the call");
  if (m.says === "hang" && Date.now() - started > 4000) problems.push(`took ${Date.now() - started} ms`);
  report(`${m.says === "throw" || m.says === "hang" ? m.says : `“${m.says}”`}  (${m.why})`, problems);
}

// 4. Tier off: the binding is never called.
{
  let called = false;
  const ai: AiBinding = { run: () => ((called = true), Promise.resolve({ response: "x" })) };
  const res = await answer("What has Kyle shipped?", { fetch: fetchFixtures, model: { tier: "off", ai } });
  report("tier off: template, model never called", [
    ...(called ? ["model was called"] : []),
    ...(res.composed === "template" ? [] : [`composed ${res.composed}`]),
  ]);
}

// 5. The per-isolate memo: repeats are reused within the TTL, keyed by params,
//    and a failed read is not cached.
{
  let clock = 0;
  let calls = 0;
  let fail = false;
  const counting: ChatFetch = async <T>(query: string, params?: Record<string, unknown>) => {
    calls++;
    if (fail) throw new Error("stub outage");
    return fetchFixtures<T>(query, params);
  };
  const memo = memoize(counting, { ttlMs: 60_000, max: 2, now: () => clock });
  const problems: string[] = [];
  await memo("count(*)", { q: [] });
  await memo("count(*)", { q: [] });
  if (calls !== 1) problems.push(`repeat within the TTL made ${calls} calls`);
  await memo("count(*)", { q: ["a*"] });
  if (calls !== 2) problems.push("different params shared an entry");
  clock = 61_000;
  await memo("count(*)", { q: [] });
  if (calls !== 3) problems.push("expired entry was reused");
  fail = true;
  await memo("count(*)", { q: ["x*"] }).catch(() => {});
  fail = false;
  await memo("count(*)", { q: ["x*"] });
  if (calls !== 5) problems.push("a failed read was cached");
  report("memo: TTL, params in the key, failures dropped", problems);
}

const total = passed + failures.length;
if (failures.length) {
  console.error(`\n${failures.length} of ${total} failed:\n  ✗ ${failures.join("\n  ✗ ")}`);
  process.exit(1);
}
console.log(`\nall ${total} passed`);
