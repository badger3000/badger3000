/**
 * Migration script: golfScores.course string -> golfCourse document reference.
 * (docs/prd/golf-handicap-and-courses.md, phase 2)
 *
 * 1. Reads every golfScores round whose `course` is still a string
 * 2. Normalises the name (trim + the NAME_FIXES map below)
 * 3. Creates one golfCourse per normalised name (_id golfCourse.<slug>)
 * 4. Rewrites each round's `course` to { _type: "reference", _ref }
 *
 * Dry run by default (reads only). Pass --apply to write.
 *
 * Usage:
 *   node --env-file=../../apps/web/.env scripts/migrate-golf-courses.mjs
 *   node --env-file=../../apps/web/.env scripts/migrate-golf-courses.mjs --apply
 *
 * Safe to re-run: rounds that already hold a reference are skipped, and the
 * course documents use createIfNotExists, so an edited course is never reset.
 * New courses are created without tees: the owner adds them in Studio (phase 3b).
 */

import {createClient} from "@sanity/client";

const apply = process.argv.includes("--apply");

const projectId =
  process.env.PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset =
  process.env.PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN;

// No dataset default: this project's dataset is private "badger3000", and a
// guessed name would point writes at a dataset that does not exist. Only the
// missing names are printed, never a value.
const missing = [
  !projectId && "PUBLIC_SANITY_PROJECT_ID (or SANITY_PROJECT_ID)",
  !dataset && "PUBLIC_SANITY_DATASET (or SANITY_DATASET)",
  !token && "SANITY_API_TOKEN (or SANITY_TOKEN)",
].filter(Boolean);
if (missing.length) {
  console.error(
    "Missing required environment variables:\n  " +
      missing.join("\n  ") +
      "\nRun with the app env: node --env-file=../../apps/web/.env scripts/<name>.mjs"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-03-09",
  useCdn: false,
  token,
});

// Typos and variants in the existing data, keyed by the trimmed original.
const NAME_FIXES = new Map([
  ["Antelope HIlls GC", "Antelope Hills GC"],
  ["Stoneridge Golf Course", "StoneRidge Golf Course"],
]);

const normalise = (raw) => {
  const trimmed = String(raw).trim().replace(/\s+/g, " ");
  return NAME_FIXES.get(trimmed) ?? trimmed;
};

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Rounds still holding a string (a reference is an object, so typeof tells them apart).
const rounds = await client.fetch(
  `*[_type == "golfScores" && defined(course) && course._type != "reference" && !defined(course._ref)]{_id, "course": course}`
);
const stringRounds = rounds.filter((r) => typeof r.course === "string" && r.course.trim());

console.log(`${apply ? "APPLY" : "DRY RUN"}: ${stringRounds.length} round(s) with a string course.\n`);
if (stringRounds.length === 0) {
  console.log("Nothing to migrate.");
  process.exit(0);
}

// name -> { id, rounds: [_id], raw: Set<original strings> }
const courses = new Map();
for (const r of stringRounds) {
  const name = normalise(r.course);
  const entry = courses.get(name) ?? {id: `golfCourse.${slugify(name)}`, rounds: [], raw: new Set()};
  entry.rounds.push(r._id);
  entry.raw.add(r.course);
  courses.set(name, entry);
}

const existing = new Set(
  await client.fetch(`*[_type == "golfCourse" && _id in $ids]._id`, {ids: [...courses.values()].map((c) => c.id)})
);

console.log("Courses:");
for (const [name, c] of courses) {
  const renamed = [...c.raw].filter((raw) => raw !== name).map((raw) => JSON.stringify(raw));
  console.log(
    `  ${c.id}  "${name}"  ${c.rounds.length} round(s)  ${existing.has(c.id) ? "(exists)" : "(create)"}` +
      (renamed.length ? `  normalised from ${renamed.join(", ")}` : "")
  );
}

if (!apply) {
  console.log("\nDry run only. Re-run with --apply to write.");
  process.exit(0);
}

// Courses first, so the references resolve when the rounds are patched.
const courseTx = client.transaction();
for (const [name, c] of courses) {
  courseTx.createIfNotExists({
    _id: c.id,
    _type: "golfCourse",
    name,
    slug: {_type: "slug", current: slugify(name)},
  });
}
await courseTx.commit();
console.log(`\n  ✓ ${courses.size} course document(s) ready`);

const BATCH_SIZE = 200;
let patched = 0;
for (const [, c] of courses) {
  for (let i = 0; i < c.rounds.length; i += BATCH_SIZE) {
    const tx = client.transaction();
    for (const id of c.rounds.slice(i, i + BATCH_SIZE)) {
      tx.patch(id, {set: {course: {_type: "reference", _ref: c.id}}});
    }
    await tx.commit();
    patched += Math.min(BATCH_SIZE, c.rounds.length - i);
  }
}

console.log(`\n✓ Done! Migrated ${patched} round(s) across ${courses.size} course(s).`);
