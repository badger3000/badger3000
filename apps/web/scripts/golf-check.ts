#!/usr/bin/env node
/**
 * The WHS engine's test table, offline: fixtures for every Rule 5.2a row,
 * ties, soft/hard caps, ESR, 9-hole rounds, missing tees, re-rated tees,
 * excluded rounds and estimated differentials.
 *
 *   pnpm run golf:check
 *
 * TODO: compare with `golfProfile.ghinIndex` once the schema/query land
 * (`checkGhin` below is the hook; pass the number and date from Sanity).
 */
import {
  adjustment,
  barHeight,
  courseHandicap,
  courseStats,
  current,
  lastRounds,
  differential,
  history,
  indexOn,
  listNames,
  round1,
  shortCourseName,
  trend,
  usedCount,
  type Round,
  type Tee,
} from "../src/lib/golf.ts";

const { process } = globalThis as unknown as { process: { exit(code?: number): never } };

const failures: string[] = [];
let passed = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failures.push(`${label}: expected ${e}, got ${a}`);
    console.log(`  ✗ ${label}\n      expected ${e}\n      got      ${a}`);
  }
}

const day = (offset: number) => new Date(Date.UTC(2024, 0, 1) + offset * 86_400_000).toISOString().slice(0, 10);
const tee: Tee = { teeKey: "blue", name: "Blue", rating: 72, slope: 130 };
const course = { name: "Prescott Golf Club", slug: "prescott-golf-club" };

/** A round on day `i` with a stored differential. */
const r = (i: number, diff: number | null, extra: Partial<Round> = {}): Round => ({
  id: `r${i}`,
  date: day(i),
  score: 85,
  differential: diff,
  tee,
  course,
  ...extra,
});
const series = (diffs: number[], start = 0) => diffs.map((d, i) => r(start + i, d));
const last = (rounds: Round[]) => current(history(rounds));

// 0. Rounding.
console.log("rounding");
check("round1(0.25) rounds half up", round1(0.25), 0.3);
check("round1(10.45) has no float artefact", round1(10.45), 10.5);
check("round1(7.875)", round1(7.875), 7.9);
check("round1(-0.04) is not -0", Object.is(round1(-0.04), 0), true);

// 1. Rule 5.2a, every row, 0–20 scores (independent of the engine's table).
console.log("rule 5.2a");
const rule: Record<number, [used: number, adj: number]> = {
  3: [1, -2], 4: [1, -1], 5: [1, 0], 6: [2, -1], 7: [2, 0], 8: [2, 0], 9: [3, 0], 10: [3, 0], 11: [3, 0],
  12: [4, 0], 13: [4, 0], 14: [4, 0], 15: [5, 0], 16: [5, 0], 17: [6, 0], 18: [6, 0], 19: [7, 0], 20: [8, 0],
};
for (let n = 0; n <= 20; n++) {
  const [used, adj] = rule[n] ?? [0, 0];
  check(`${n} scores: usedCount/adjustment`, [usedCount(n), adjustment(n)], [used, adj]);
  // Falling differentials 30, 29, … so the lowest are the most recent; no ESR, no caps.
  const diffs = Array.from({ length: n }, (_, i) => 30 - i);
  const entry = last(series(diffs));
  if (!used) {
    check(`${n} scores: no index`, entry?.index ?? null, null);
    continue;
  }
  const lowest = diffs.slice(-used);
  const expected = round1(lowest.reduce((s, d) => s + d, 0) / used + adj);
  check(`${n} scores: index`, entry?.index, expected);
  check(`${n} scores: counted size`, entry?.counted.size, used);
}
{
  const diffs = Array.from({ length: 25 }, (_, i) => 30 - i);
  const entry = last(series(diffs));
  check("25 scores: window is the last 20", entry?.window.length, 20);
  check("25 scores: lowest 8 of the last 20", entry?.index, round1(diffs.slice(-8).reduce((s, d) => s + d, 0) / 8));
}

// 2. Ties at the cut-off.
console.log("ties");
{
  // Falling differentials (no ESR); the 8th and 9th lowest are both 16.0 (r11, r12): the more recent counts.
  const diffs = [27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 16, 15, 14, 13, 12, 11, 10, 9];
  const entry = last(series(diffs));
  check("tie: 8 counted", entry?.counted.size, 8);
  check("tie: index", entry?.index, round1((9 + 10 + 11 + 12 + 13 + 14 + 15 + 16) / 8));
  check("tie: the more recent 16.0 counts, the older does not", [entry?.counted.has("r11"), entry?.counted.has("r12")], [false, true]);
}

// 3. Soft cap, hard cap, and when caps do not apply.
console.log("caps");
{
  const soft = last([...series(Array(20).fill(10)), ...series(Array(20).fill(15), 20)]);
  // The Low HI is 8.0, not 10.0: the 3-score index (10 − 2.0) is in the record.
  check("soft cap: low 8.0, raw 15.0 → 8 + 3 + 4/2 = 13.0", [soft?.index, soft?.lowIndex, soft?.capped], [13, 8, "soft"]);
  const hard = last([...series(Array(20).fill(10)), ...series(Array(20).fill(20), 20)]);
  check("hard cap: low 8.0, raw 20.0 → 8 + 5 = 13.0", [hard?.index, hard?.lowIndex, hard?.capped], [13, 8, "hard"]);
  const early = history([...series([5, 5, 5, 5]), ...series(Array(15).fill(40), 4)]);
  check("no cap before 20 scores (19 scores, raw 20.0)", [early.at(-1)?.index, early.at(-1)?.lowIndex], [20, null]);
  const twentieth = last([...series([5, 5, 5, 5]), ...series(Array(16).fill(40), 4)]);
  check("20th score: Low HI 3.0 (3-score index) → hard cap 8.0", [twentieth?.index, twentieth?.lowIndex, twentieth?.capped], [8, 3, "hard"]);
  // Low HI looks back 365 days only.
  const gap = history([...series(Array(20).fill(10)), ...series(Array(2).fill(30), 500)]);
  check("Low HI ignores indexes older than 365 days", gap.at(-2)?.lowIndex, null);
  check("maximum index is 54.0", last(series([60, 60, 60]))?.index, 54);
}

// 4. Exceptional score reduction.
console.log("esr");
{
  const base = series(Array(20).fill(12));
  const withLast = (d: number) => history([...base, r(20, d)]).at(-1);
  check("ESR −1: 8.0 below index", [withLast(4)?.esr, withLast(4)?.index], [1, 10]);
  check("ESR boundary 7.0 below → −1", withLast(5)?.esr, 1);
  check("ESR boundary 6.9 below → none", withLast(5.1)?.esr, 0);
  check("ESR boundary 10.0 below → −2", withLast(2)?.esr, 2);
  check("ESR −2: 11.0 below index", withLast(1)?.index, round1((-1 + 7 * 10) / 8));
  const cumulative = history([...base, r(20, 4), r(21, 2)]).at(-1);
  check("ESR cumulative: two −1 reductions", [cumulative?.esr, cumulative?.index], [1, 7.9]);
  check("ESR cumulative: adjusted differentials", cumulative?.window.slice(-3).map((w) => w.adjusted), [10, 2, 1]);
  check("ESR keeps the stored differential", cumulative?.window.at(-1)?.diff, 2);
}

// 5. 9-hole rounds use GHIN's combined differential.
console.log("9 holes");
{
  const nine = r(0, 15.7, { holes: 9, score: 40, tee: { ...tee, rating: 35.1, slope: 120 } });
  check("9-hole differential is GHIN's value", differential(nine), { value: 15.7, estimated: false });
  const entry = last([nine, r(1, 12), r(2, 11)]);
  check("9-hole round counts in the index", [entry?.index, entry?.counted.has("r0")], [round1(11 - 2), false]);
}

// 6. Missing tee.
console.log("missing tee");
{
  const noTee: Round = { id: "x", date: day(5), score: 80, tee: null };
  check("no tee, no differential → null", differential(noTee), null);
  check("no tee with a stored differential still counts", differential({ ...noTee, differential: 9.1 }), { value: 9.1, estimated: false });
  const entry = last([r(0, 10), r(1, 11), noTee]);
  check("a round without a differential is not in the record (2 scores → no index)", [entry?.index ?? null, entry?.window.length], [null, 2]);
}

// 7. A tee re-rated after the round: the snapshot is kept.
console.log("re-rated tee");
{
  const courseTees = [{ teeKey: "blue", name: "Blue", rating: 72, slope: 130 }];
  const snapshot = { ...courseTees[0] };
  const round: Round = { id: "a", date: day(0), score: 85, tee: snapshot, course };
  const before = differential(round);
  courseTees[0].rating = 73.5; // the course is re-rated
  check("differential from the snapshot", before, { value: round1((113 / 130) * (85 - 72)), estimated: true });
  check("re-rating the course changes nothing", differential(round), before);
}

// 8. Excluded rounds.
console.log("excluded");
{
  const diffs = [14, 13, 12, 11];
  const withExcluded = [...series(diffs), r(4, 1, { excluded: true })];
  check("excluded round does not change the index", last(withExcluded)?.index, last(series(diffs))?.index);
  check("excluded round is not in the window", last(withExcluded)?.window.length, 4);
}

// 9. Estimated flag.
console.log("estimated");
{
  const est: Round = { id: "e", date: day(0), score: 85, tee: { ...tee, rating: 72.4, slope: 131 } };
  check("estimate = 113/slope × (score − rating), 1 dp", differential(est), { value: 10.9, estimated: true });
  const entry = last([est, r(1, 11), r(2, 12)]);
  check("estimated flag carries into the window", entry?.window.map((w) => w.estimated), [true, false, false]);
}

// 10. Aggregates.
console.log("aggregates");
{
  const other = { name: "Stoneridge Golf Course", slug: "stoneridge" };
  const red: Tee = { ...tee, teeKey: "red", name: "Red" };
  const rounds = [
    r(0, 14, { score: 90 }),
    r(1, 12, { score: 86, tee: red }),
    r(2, 13, { score: 88, course: other }),
    r(3, 11, { score: 84 }),
  ];
  const entry = last(rounds)!;
  const stats = courseStats(entry.window, entry.counted);
  check("courses sorted by rounds", stats.map((s) => [s.slug, s.rounds]), [["prescott-golf-club", 3], ["stoneridge", 1]]);
  const p = stats[0];
  check("course best/avg/bestDiff/lastPlayed", [p.best, p.avg, p.bestDiff, p.lastPlayed], [84, 86.7, 11, day(3)]);
  check("tees played", [...p.teesPlayed], [["blue", 2], ["red", 1]]);
  check("counting = lowest 1 of 4 scores (index −1.0)", stats.map((s) => s.counting), [1, 0]);
  check("trend since a date", trend(history(rounds), day(3)), round1(entry.index! - history(rounds)[2].index!));
  check("trend with nothing before → null", trend(history(rounds), day(0)), null);
  check("barHeight: lowest is the floor, highest is 1", [barHeight(11, entry.window), barHeight(14, entry.window)], [0.15, 1]);
  check("barHeight: flat window", barHeight(10, last(series([10, 10, 10]))!.window), 0.6);
}

// 11. Rounds shown in the table.
console.log("last rounds");
{
  const noTee: Round = { id: "nt", date: day(30), score: 80, tee: null };
  const many = [...series(Array.from({ length: 22 }, (_, i) => 20 - i * 0.1)), noTee, r(40, 1, { excluded: true })];
  const shown = lastRounds(many);
  check("20 most recent, excluded left out", [shown.length, shown.at(-1)?.id, shown[0].id], [20, "nt", "r3"]);
  check("round with no differential stays with diff null", [shown.at(-1)?.diff, shown.at(-1)?.estimated], [null, false]);
  check("oldest first", shown.map((x) => x.date).join() === [...shown.map((x) => x.date)].sort().join(), true);
  check("fewer than 20 returns all", lastRounds(series([10, 11])).length, 2);
}

// 12. Rounds with a course but no differential (a freshly migrated dataset).
console.log("course stats without differentials");
{
  const other = { name: "Stoneridge Golf Course", slug: "stoneridge" };
  const bare = (i: number, score: number, c = course): Round => ({ id: `n${i}`, date: day(i), score, tee: null, course: c });
  const rounds = [bare(0, 90), bare(1, 84), bare(2, 88, other)];
  const shown = lastRounds(rounds);
  check("shown rounds keep their course", shown.map((x) => x.course?.slug), ["prescott-golf-club", "prescott-golf-club", "stoneridge"]);
  const stats = courseStats(shown, new Set());
  check("they still count in course stats", stats.map((s) => [s.slug, s.rounds, s.best, s.avg, s.bestDiff, s.counting]), [
    ["prescott-golf-club", 2, 84, 87, null, 0],
    ["stoneridge", 1, 88, 88, null, 0],
  ]);
  const mixed = courseStats(lastRounds([r(0, 12, { score: 86 }), bare(1, 84)]), new Set());
  check("bestDiff ignores rounds with none", [mixed[0].rounds, mixed[0].bestDiff], [2, 12]);
}

console.log("\nfacility labels");
check("short label strips the shared words", shortCourseName("Antelope Hills North", "Antelope Hills Golf Courses"), "North");
check("short label is case-insensitive", shortCourseName("antelope hills South", "Antelope Hills Golf Courses"), "South");
check("no shared prefix keeps the full name", shortCourseName("Desert Mountain", "Antelope Hills Golf Courses"), "Desert Mountain");
check("a name equal to the facility stays whole", shortCourseName("Antelope Hills", "Antelope Hills"), "Antelope Hills");
check("no facility keeps the name", shortCourseName("Eastmoreland", undefined), "Eastmoreland");
check("listNames joins", [listNames([]), listNames(["North"]), listNames(["North", "South"]), listNames(["A", "B", "C"])], ["", "North", "North and South", "A, B and C"]);

// Course handicap (Rule 6.1a, unrounded, 1 dp) and the index in effect that day.
{
  const h = history(series([10, 11, 12]));
  check("indexOn: before any round", indexOn(h, day(0)), null);
  check("indexOn: 2 rounds give no index yet", indexOn(h, day(2)), null);
  check("indexOn: the day after round 3 uses its index", indexOn(h, day(3)), 8);
  check("indexOn: a later day keeps the last index", indexOn(h, day(40)), 8);
  check("courseHandicap 7.2 on 74.6/136 par 72", courseHandicap(7.2, { rating: 74.6, slope: 136, par: 72 }), 11.3);
  check("courseHandicap can be negative", courseHandicap(0, { rating: 69, slope: 120, par: 72 }), -3);
  check("courseHandicap null without an index", courseHandicap(null, { rating: 72, slope: 130, par: 72 }), null);
  check("courseHandicap null without par", courseHandicap(7.2, { rating: 72, slope: 130 }), null);
  check("courseHandicap null for 9 holes", courseHandicap(7.2, { rating: 72, slope: 130, par: 72 }, 9), null);
  check("courseHandicap null without a tee", courseHandicap(7.2, undefined), null);
}

// GHIN agreement (hook): the schema/query for golfProfile.ghinIndex is built elsewhere.
/** Warns when the computed index differs from GHIN's by more than 0.1. */
export function checkGhin(rounds: Round[], ghinIndex?: number | null): string | null {
  if (ghinIndex == null) return null; // TODO: wire to golfProfile once the query exists
  const computed = last(rounds)?.index ?? null;
  return computed === null || Math.abs(computed - ghinIndex) > 0.1
    ? `computed index ${computed} differs from GHIN ${ghinIndex}: a missing round or a mistyped differential?`
    : null;
}
check("ghin hook: skipped without an index", checkGhin(series([10, 11, 12])), null);
check("ghin hook: agrees", checkGhin(series([10, 11, 12]), 8), null);
check("ghin hook: warns past 0.1", checkGhin(series([10, 11, 12]), 9) !== null, true);

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log(failures.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
