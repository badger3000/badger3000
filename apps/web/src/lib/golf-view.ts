/**
 * The golf page's view model: Sanity's one fetch + the WHS engine → plain
 * values for the components. No markup here and no Sanity calls; `golf.ts` does
 * the maths and `sanity/golf.ts` maps the rows. Rounds on an unmigrated dataset
 * have no course, tee or differential, so every figure here tolerates "none".
 */
import { gradientFor } from "@badger3000/tokens/covers";
import { imageUrl } from "@badger3000/sanity";
import { barHeight, courseStats, current, history, lastRounds, trend, usedCount, WINDOW, type ShownRound } from "./golf.ts";
import { toRound } from "./sanity/golf.ts";
import type { GolfCourse, GolfPage } from "./sanity/types.ts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const parts = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m: m - 1, d };
};
/** "Nov 15, 2026" — from the ISO date's own fields, so no timezone can shift it. */
export const longDate = (iso: string) => {
  const { y, m, d } = parts(iso);
  return `${MONTHS[m]} ${d}, ${y}`;
};
export const shortDate = (iso: string) => {
  const { m, d } = parts(iso);
  return `${MONTHS[m]} ${d}`;
};
const monthYear = (iso: string) => {
  const { y, m } = parts(iso);
  return `${MONTHS[m]} ${y}`;
};

const diffText = (n: number | null) => (n === null ? "—" : n.toFixed(1));
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** The pen's drawer spark: width ∝ (13.5 − differential), better is longer. */
const spark = (diff: number | null) => (diff === null ? 0 : Math.min(1, Math.max(0.05, (13.5 - diff) / 8.5)));

export type TeeView = {
  key: string;
  name: string;
  color?: string;
  yardage?: number;
  rating: number;
  slope: number;
  played: number;
  mostPlayed: boolean;
};

export type RoundView = {
  id: string;
  course?: { name: string; slug: string };
  teeName?: string;
  teeColor?: string;
  date: string;
  dateIso: string;
  score: number;
  diff: string;
  estimated: boolean;
  counts: boolean;
  label: string;
};

export type ChartCol = { id: string; score: number; height: number; counts: boolean; label: string };

export type CourseView = {
  slug: string;
  name: string;
  location?: string;
  meta: string;
  parLine: string;
  description?: string;
  website?: string;
  cover: string;
  image?: { src: string; srcset: string; alt: string };
  card: { rating?: string; image?: { src: string; srcset: string; alt: string } };
  tees: TeeView[];
  rounds: number;
  best: number;
  avg: string;
  bestDiff: string;
  counting: number;
  lastPlayed: string;
  recent: { id: string; label: string; score: number; diff: string; counts: boolean; width: number }[];
};

export type GolfView = {
  total: number;
  badge: string | undefined;
  shown: RoundView[];
  countedCount: number;
  used: number;
  handicap: { index: number | null; trend: number | null; since: string; note: string; source: "ghin" | "computed"; needs: number };
  summary: { best: number; avg: string; courses: number };
  chart: { cols: ChartCol[]; first?: string; last?: string };
  courses: CourseView[];
  range?: string;
};

const photo = (course: GolfCourse, width: number) => {
  const url = course.image?.asset?.url;
  const src = imageUrl(url, { width });
  const double = imageUrl(url, { width: width * 2 });
  if (!src || !double) return undefined;
  return { src, srcset: `${src} 1x, ${double} 2x`, alt: course.image?.alt || course.name };
};

export function buildGolfView(page: GolfPage, today = new Date()): GolfView {
  const all = page.rounds.map(toRound);
  const h = history(all);
  const cur = current(h);
  const counted = cur?.counted ?? new Set<string>();
  const shown = lastRounds(all, WINDOW);
  const scored = shown.filter((r): r is ShownRound & { diff: number } => r.diff !== null);

  const toView = (r: ShownRound): RoundView => {
    const counts = counted.has(r.id);
    const view = {
      id: r.id,
      course: r.course ?? undefined,
      teeName: r.tee?.name || undefined,
      teeColor: r.tee?.color ?? undefined,
      date: longDate(r.date),
      dateIso: r.date,
      score: r.score,
      diff: diffText(r.diff),
      estimated: r.estimated,
      counts,
    };
    return {
      ...view,
      label: `${r.course?.name ?? "Unknown course"}, ${view.date}: ${r.score}${r.diff !== null ? `, diff ${view.diff}` : ""}${counts ? ", counts" : ""}`,
    };
  };
  const shownViews = shown.map(toView);

  // Handicap card. A GHIN number newer than the last round wins over ours.
  const lastDate = shown.at(-1)?.date ?? "";
  const profile = page.profile;
  const useGhin = profile?.ghinIndex != null && !!profile.ghinIndexDate && profile.ghinIndexDate >= lastDate;
  const prevMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
  const prevStart = prevMonth.toISOString().slice(0, 10);
  const n = cur?.window.length ?? 0;
  const used = cur?.counted.size ?? 0;
  const estimated = cur?.window.filter((w) => w.estimated).length ?? 0;
  const index = useGhin ? profile!.ghinIndex! : (cur?.index ?? null);
  let note: string;
  if (useGhin) note = `From GHIN, ${longDate(profile!.ghinIndexDate!)}.`;
  else if (cur?.index == null) note = "Three scores with a differential give a Handicap Index (World Handicap System).";
  else {
    note =
      n >= WINDOW
        ? `Average of the ${used} lowest score differentials from the last ${n} rounds, per the World Handicap System.`
        : `Average of the ${used === 1 ? "lowest" : `${used} lowest`} score ${used === 1 ? "differential" : "differentials"} from ${n} rounds so far, per the World Handicap System. It settles at ${WINDOW}.`;
    if (estimated) note += ` Includes ${estimated} estimated ${estimated === 1 ? "round" : "rounds"}.`;
  }

  const stats = courseStats(
    // `courseStats` aggregates the scored rounds in the shown 20.
    (cur?.window ?? []).filter((w) => shown.some((s) => s.id === w.id)),
    counted,
  );
  const byCourse = new Map(page.courses.map((c) => [c.slug ?? c.name, c]));

  const courses: CourseView[] = stats.map((s) => {
    const meta = byCourse.get(s.slug);
    const rs = shownViews.filter((r) => r.course?.slug === s.slug).reverse();
    const tees: TeeView[] = (meta?.tees ?? []).map((t) => ({
      key: t._key,
      name: t.name,
      color: (t.color === "custom" ? t.customColor : t.color) ?? undefined,
      yardage: t.yardage ?? undefined,
      rating: t.rating,
      slope: t.slope,
      played: s.teesPlayed.get(t._key) ?? 0,
      mostPlayed: false,
    }));
    const top = Math.max(0, ...tees.map((t) => t.played));
    if (top > 0) tees.find((t) => t.played === top)!.mostPlayed = true;
    const main = tees.find((t) => t.mostPlayed);
    const par = meta?.par;
    return {
      slug: s.slug,
      name: s.name,
      location: meta?.location ?? undefined,
      meta: [meta?.location, meta?.access && cap(meta.access), meta?.holes && `${meta.holes} holes`].filter(Boolean).join(" · "),
      parLine: [par != null && `Par ${par}`, tees.length > 0 && `${tees.length} ${tees.length === 1 ? "tee" : "tees"}`]
        .filter(Boolean)
        .join(" · "),
      description: meta?.description || undefined,
      website: meta?.website ?? undefined,
      cover: gradientFor(s.slug),
      image: meta ? photo(meta, 432) : undefined,
      card: {
        rating: main ? `${main.rating} / ${main.slope}` : undefined,
        image: meta ? photo(meta, 254) : undefined,
      },
      tees,
      rounds: s.rounds,
      best: s.best,
      avg: s.avg.toFixed(1),
      bestDiff: diffText(s.bestDiff),
      counting: s.counting,
      lastPlayed: shortDate(s.lastPlayed),
      recent: rs.map((r) => ({
        id: r.id,
        label: `${r.date}${r.teeName ? ` · ${r.teeName}` : ""}`,
        score: r.score,
        diff: r.diff,
        counts: r.counts,
        width: spark(r.diff === "—" ? null : Number(r.diff)),
      })),
    };
  });

  const best = shown.length ? Math.min(...shown.map((r) => r.score)) : 0;
  const avg = shown.length ? (shown.reduce((sum, r) => sum + r.score, 0) / shown.length).toFixed(1) : "0.0";
  const window = cur?.window ?? [];
  // Pen: lower differential = taller bar. `barHeight` runs the other way round
  // (its lowest is the floor), so mirror it; a round with no differential gets a stub.
  const cols: ChartCol[] = shown.map((r, i) => ({
    id: r.id,
    score: r.score,
    height: r.diff === null ? 0.08 : Math.max(0.15, 1.15 - barHeight(r.diff, window)),
    counts: counted.has(r.id),
    label: shownViews[i].label,
  }));

  const total = all.length;
  return {
    total,
    badge: total === 0 ? undefined : total > WINDOW ? `Last ${WINDOW} of ${total}` : `${total} ${total === 1 ? "round" : "rounds"}`,
    shown: shownViews,
    countedCount: counted.size,
    used: used || usedCount(n),
    handicap: {
      index,
      trend: useGhin || !cur ? null : trend(h, prevStart),
      since: MONTHS[prevMonth.getUTCMonth()],
      note,
      source: useGhin ? "ghin" : "computed",
      needs: Math.max(1, 3 - scored.length),
    },
    summary: { best, avg, courses: courses.length },
    chart: { cols, first: shown.length ? monthYear(shown[0].date) : undefined, last: shown.length ? monthYear(shown.at(-1)!.date) : undefined },
    courses,
    range: shown.length
      ? (() => {
          const a = parts(shown[0].date);
          const b = parts(shown.at(-1)!.date);
          const span = a.y === b.y ? `${MONTHS[a.m]} – ${MONTHS[b.m]} ${b.y}` : `${MONTHS[a.m]} ${a.y} – ${MONTHS[b.m]} ${b.y}`;
          return shown.length >= WINDOW ? `${span} · oldest rolls off as newer rounds land` : span;
        })()
      : undefined,
  };
}
