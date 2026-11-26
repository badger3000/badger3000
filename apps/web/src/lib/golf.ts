/**
 * The World Handicap System engine for the golf page, pure TypeScript.
 * No Sanity imports: callers map their documents onto `Round`.
 *
 * Rules referenced are the USGA Rules of Handicapping (2024), Rule 5.
 * Scope: the maths that needs no hole scores or PCC. Each round's differential
 * is copied from GHIN (`differential`); the estimate from score/rating/slope is
 * only a fallback and is flagged `estimated` (docs/prd/golf-handicap-and-courses.md).
 */

export type Tee = {
  teeKey: string;
  name: string;
  color?: string | null;
  gender?: string | null;
  par?: number | null;
  yardage?: number | null;
  rating: number;
  slope: number;
};

export type Round = {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  /** Gross score. */
  score: number;
  holes?: number | null;
  /** GHIN's differential, when entered. */
  differential?: number | null;
  excluded?: boolean | null;
  /** Snapshot of the tee as it was rated when the round was entered. */
  tee?: Tee | null;
  course?: { name: string; slug: string } | null;
};

export type Differential = { value: number; estimated: boolean };

/** A round inside the scoring record, with the numbers the index used. */
export type WindowRound = Round & {
  /** Differential as stored/estimated. */
  diff: number;
  /** `diff` after any exceptional score reductions (5.9). */
  adjusted: number;
  estimated: boolean;
};

export type HistoryEntry = {
  date: string;
  /** Handicap Index after this date's last round; null below 3 scores. */
  index: number | null;
  /** Low Handicap Index (5.7); null until there are 20 scores. */
  lowIndex: number | null;
  /** Ids of the rounds whose differentials made up the index. */
  counted: Set<string>;
  /** The most recent (up to) 20 scored rounds, oldest first. */
  window: WindowRound[];
  /** Which cap limited the index (5.8), if any. */
  capped: "soft" | "hard" | null;
  /** Exceptional score reduction triggered by this round (5.9): 0, 1 or 2. */
  esr: number;
};

/** Rule 5.3: the highest index. */
export const MAX_INDEX = 54;
/** Rule 5.2: the record is the most recent 20 scores. */
export const WINDOW = 20;

/**
 * Round half up to 1 dp (the WHS convention for every figure). The
 * `toPrecision` pass removes float artefacts such as 10.45 * 10 = 104.49999.
 */
export function round1(n: number): number {
  return Math.round(Number((n * 10).toPrecision(12))) / 10 || 0;
}

/**
 * Rule 5.1a, as far as we can: stored GHIN differential, else
 * `113 / slope × (score − rating)` (PCC 0) flagged estimated, else null (no tee).
 * A 9-hole round's estimate is rough; copy GHIN's value (5.1b).
 */
export function differential(round: Round): Differential | null {
  if (typeof round.differential === "number" && Number.isFinite(round.differential)) {
    return { value: round.differential, estimated: false };
  }
  const tee = round.tee;
  if (!tee || !(tee.slope > 0) || !Number.isFinite(tee.rating)) return null;
  return { value: round1((113 / tee.slope) * (round.score - tee.rating)), estimated: true };
}

/** Rule 5.2a, as data: scores in the record → differentials used and adjustment. */
export const TABLE_5_2A: ReadonlyArray<{ from: number; to: number; used: number; adjustment: number }> = [
  { from: 3, to: 3, used: 1, adjustment: -2 },
  { from: 4, to: 4, used: 1, adjustment: -1 },
  { from: 5, to: 5, used: 1, adjustment: 0 },
  { from: 6, to: 6, used: 2, adjustment: -1 },
  { from: 7, to: 8, used: 2, adjustment: 0 },
  { from: 9, to: 11, used: 3, adjustment: 0 },
  { from: 12, to: 14, used: 4, adjustment: 0 },
  { from: 15, to: 16, used: 5, adjustment: 0 },
  { from: 17, to: 18, used: 6, adjustment: 0 },
  { from: 19, to: 19, used: 7, adjustment: 0 },
  { from: 20, to: Infinity, used: 8, adjustment: 0 },
];

const row = (n: number) => TABLE_5_2A.find((r) => n >= r.from && n <= r.to);

/** Rule 5.2/5.2a: how many of the lowest differentials count for `n` scores (0 = no index). */
export const usedCount = (n: number): number => row(n)?.used ?? 0;

/** Rule 5.2a: the adjustment added to the average for `n` scores. */
export const adjustment = (n: number): number => row(n)?.adjustment ?? 0;

const dayNumber = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
};

/** Lowest differentials first; among ties the more recent round counts. */
const byLowest = (a: WindowRound, b: WindowRound) =>
  a.adjusted - b.adjusted || (a.date < b.date ? 1 : a.date > b.date ? -1 : 0) || (a.id < b.id ? -1 : 1);

/**
 * Replays every non-excluded round with a differential, in date order, and
 * returns the index after each date. Per round:
 *  - 5.9 ESR: new differential vs the index *before* the round; 7.0–9.9 below
 *    → −1.0, 10.0+ → −2.0, applied to the most recent 20 differentials
 *    (including this one) and cumulative with earlier reductions.
 *  - 5.2/5.2a: average of the lowest N of the last 20 (+ adjustment).
 *  - 5.7: Low HI = lowest index in the 365 days before this round, only once
 *    there are 20 scores.
 *  - 5.8: rises over 3.0 above Low HI are halved (soft cap); never more than
 *    5.0 above (hard cap). Only once a Low HI exists.
 *  - 5.3: never above 54.0.
 * Rounds on the same date collapse into one entry (the last round's state).
 */
export function history(rounds: Round[]): HistoryEntry[] {
  const scored = rounds
    .filter((r) => !r.excluded)
    .flatMap((r) => {
      const d = differential(r);
      return d ? [{ ...r, diff: d.value, adjusted: d.value, estimated: d.estimated } as WindowRound] : [];
    })
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1));

  const record: WindowRound[] = [];
  const reductions = new Map<string, number>();
  const past: { date: string; index: number | null }[] = [];
  const entries: HistoryEntry[] = [];
  let prevIndex: number | null = null;

  for (const round of scored) {
    record.push(round);
    const recent = record.slice(-WINDOW);

    let esr = 0;
    if (prevIndex !== null) {
      const below = round1(prevIndex - round.diff);
      esr = below >= 10 ? 2 : below >= 7 ? 1 : 0;
    }
    if (esr) for (const w of recent) reductions.set(w.id, (reductions.get(w.id) ?? 0) + esr);

    const window = recent.map((w) => ({ ...w, adjusted: round1(w.diff - (reductions.get(w.id) ?? 0)) }));
    const n = window.length;
    const used = usedCount(n);

    let index: number | null = null;
    const counted = new Set<string>();
    if (used) {
      const lowest = [...window].sort(byLowest).slice(0, used);
      lowest.forEach((w) => counted.add(w.id));
      index = round1(lowest.reduce((s, w) => s + w.adjusted, 0) / used + adjustment(n));
    }

    let lowIndex: number | null = null;
    if (record.length >= WINDOW) {
      const from = dayNumber(round.date) - 365;
      for (const p of past) {
        if (p.index !== null && p.date < round.date && dayNumber(p.date) >= from) {
          lowIndex = lowIndex === null ? p.index : Math.min(lowIndex, p.index);
        }
      }
    }

    let capped: HistoryEntry["capped"] = null;
    if (index !== null && lowIndex !== null) {
      if (index - lowIndex > 3) {
        index = round1(lowIndex + 3 + (index - lowIndex - 3) / 2);
        capped = "soft";
      }
      if (index - lowIndex > 5) {
        index = round1(lowIndex + 5);
        capped = "hard";
      }
    }
    if (index !== null) index = Math.min(MAX_INDEX, index);

    past.push({ date: round.date, index });
    prevIndex = index;

    const entry: HistoryEntry = { date: round.date, index, lowIndex, counted, window, capped, esr };
    if (entries.length && entries[entries.length - 1].date === round.date) entries[entries.length - 1] = entry;
    else entries.push(entry);
  }
  return entries;
}

export type ShownRound = Round & { diff: number | null; estimated: boolean };

/**
 * The `n` most recent non-excluded rounds (oldest first), for the table and
 * chart. Unlike the scoring record, rounds with no differential stay in, with
 * `diff: null` (shown as "—", can't count).
 */
export function lastRounds(rounds: Round[], n = WINDOW): ShownRound[] {
  return rounds
    .filter((r) => !r.excluded)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1))
    .slice(-n)
    .map((r) => {
      const d = differential(r);
      return { ...r, diff: d?.value ?? null, estimated: d?.estimated ?? false };
    });
}

/** The latest entry, or null with no scored rounds. */
export const current = (h: HistoryEntry[]): HistoryEntry | null => h[h.length - 1] ?? null;

/**
 * Change in index since `sinceDate` (YYYY-MM-DD): the current index minus the
 * index after the last round before that date. Null when either is missing.
 */
export function trend(h: HistoryEntry[], sinceDate: string): number | null {
  const now = current(h)?.index ?? null;
  const before = [...h].reverse().find((e) => e.date < sinceDate)?.index ?? null;
  return now === null || before === null ? null : round1(now - before);
}

export type CourseStat = {
  name: string;
  slug: string;
  rounds: number;
  best: number;
  avg: number;
  /** Lowest differential among the rounds that have one; null when none do. */
  bestDiff: number | null;
  lastPlayed: string;
  /** How many of this course's rounds are counted in the index. */
  counting: number;
  teesPlayed: Map<string, number>;
};

/**
 * Per-course aggregates over the rounds shown (the last 20), sorted by rounds
 * desc, then lastPlayed desc. `best`/`avg` are gross scores; `bestDiff` the
 * lowest differential. Rounds without a course are skipped; rounds without a
 * differential still count as rounds (and for `best`/`avg`).
 */
export function courseStats(window: Array<Round & { diff: number | null }>, counted: Set<string>): CourseStat[] {
  const by = new Map<string, Array<Round & { diff: number | null }>>();
  for (const r of window) {
    if (!r.course) continue;
    by.set(r.course.slug, [...(by.get(r.course.slug) ?? []), r]);
  }
  return [...by.values()]
    .map((rs) => {
      const teesPlayed = new Map<string, number>();
      for (const r of rs) if (r.tee) teesPlayed.set(r.tee.teeKey, (teesPlayed.get(r.tee.teeKey) ?? 0) + 1);
      return {
        name: rs[0].course!.name,
        slug: rs[0].course!.slug,
        rounds: rs.length,
        best: Math.min(...rs.map((r) => r.score)),
        avg: round1(rs.reduce((s, r) => s + r.score, 0) / rs.length),
        bestDiff: rs.some((r) => r.diff !== null) ? Math.min(...rs.flatMap((r) => (r.diff === null ? [] : [r.diff]))) : null,
        lastPlayed: rs.map((r) => r.date).reduce((a, b) => (a > b ? a : b)),
        counting: rs.filter((r) => counted.has(r.id)).length,
        teesPlayed,
      };
    })
    .sort((a, b) => b.rounds - a.rounds || (a.lastPlayed < b.lastPlayed ? 1 : a.lastPlayed > b.lastPlayed ? -1 : 0));
}

/**
 * Chart bar height as a 0–1 fraction, scaled to the rounds shown: the lowest
 * differential is the shortest bar (floor 0.15, so it stays visible), the
 * highest is 1. A flat window gets 0.6. Differentials are higher = worse.
 */
export function barHeight(diff: number | null, window: WindowRound[]): number {
  if (diff === null || !window.length) return 0;
  const values = window.map((w) => w.diff);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 0.6;
  return 0.15 + 0.85 * ((diff - min) / (max - min));
}

/**
 * A layout's short label inside its facility: the course name without the
 * words it shares with the facility's start ("Antelope Hills North" at
 * "Antelope Hills Golf Courses" → "North"). Falls back to the full name when
 * nothing is shared or nothing would be left.
 */
export function shortCourseName(name: string, facility?: string | null): string {
  const f = (facility ?? "").trim().split(/\s+/).filter(Boolean);
  const n = name.trim().split(/\s+/).filter(Boolean);
  let i = 0;
  while (i < f.length && i < n.length && f[i].toLowerCase() === n[i].toLowerCase()) i++;
  return i > 0 && i < n.length ? n.slice(i).join(" ") : name;
}

/** "North", "North and South", "East, North and South". */
export function listNames(names: string[]): string {
  return names.length < 2 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}
