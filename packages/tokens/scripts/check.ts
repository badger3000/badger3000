/**
 * tokens check — keep the TypeScript name lists honest against tokens.css.
 *
 * tokens.css is the only source of values; src/tokens.ts and src/covers.ts
 * only name things in it. This fails when they disagree: a semantic token
 * missing from either side, a skin without a `[data-theme]` block, or a cover
 * or tint count that no longer matches the numbered primitives.
 *
 * Usage: node scripts/check.ts   (Node strips the types itself)
 */
import { readFileSync } from "node:fs";
import { semanticTokens, themes } from "../src/tokens.ts";
import { COVER_COUNT, TINT_COUNT } from "../src/covers.ts";

const css = readFileSync(new URL("../tokens.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const problems: string[] = [];

const declared = (pattern: RegExp) => new Set([...css.matchAll(pattern)].map((match) => match[1]));

const inCss = declared(/--(a-[\w-]+)\s*:/g);
const inTs = new Set<string>(semanticTokens);
for (const name of inCss) if (!inTs.has(name)) problems.push(`--${name} is in tokens.css but not in src/tokens.ts`);
for (const name of inTs) if (!inCss.has(name)) problems.push(`--${name} is in src/tokens.ts but not in tokens.css`);

// Light is the :root default; every other skin needs its block.
for (const theme of themes.slice(1)) {
  if (!css.includes(`[data-theme="${theme}"]`)) problems.push(`no [data-theme="${theme}"] block in tokens.css`);
}

const count = (pattern: RegExp) => declared(pattern).size;
const covers = count(/--p-cover-(\d+)-from\s*:/g);
const coverEnds = count(/--p-cover-(\d+)-to\s*:/g);
const tints = count(/--p-tint-(\d+)\s*:/g);
if (covers !== COVER_COUNT || coverEnds !== COVER_COUNT)
  problems.push(`COVER_COUNT is ${COVER_COUNT}, tokens.css has ${covers} -from and ${coverEnds} -to`);
if (tints !== TINT_COUNT) problems.push(`TINT_COUNT is ${TINT_COUNT}, tokens.css has ${tints} --p-tint-N`);

if (problems.length > 0) {
  for (const problem of problems) console.error(`tokens: ${problem}`);
  process.exit(1);
}
console.log(`tokens: ${inCss.size} semantic tokens, ${themes.length} skins, ${covers} covers, ${tints} tints — in sync`);
