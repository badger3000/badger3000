import type { Round } from "../golf.ts";
import type { GolfRoundRow } from "./types.ts";

/**
 * Sanity rows → the WHS engine's `Round`. Everything the schema leaves optional
 * is `field ?? undefined`. `course` is a reference after the migration and a
 * string before it, so a round can arrive with no course (typegen types the
 * reference as present); the page shows it as "—" and skips it in course stats.
 * A custom tee colour comes through as its hex, a named one as its name:
 * `TeeSwatch` resolves both.
 */
export function toRound(row: GolfRoundRow): Round {
  const { tee, course } = row as Omit<GolfRoundRow, "course"> & { course: GolfRoundRow["course"] | null };
  return {
    id: row._id,
    date: row.date,
    score: row.score,
    holes: row.holes ?? undefined,
    differential: row.differential ?? undefined,
    excluded: row.excluded ?? undefined,
    tee:
      tee && tee.teeKey && tee.rating != null && tee.slope != null
        ? {
            teeKey: tee.teeKey,
            name: tee.name ?? "",
            color: (tee.color === "custom" ? tee.customColor : tee.color) ?? undefined,
            gender: tee.gender ?? undefined,
            par: tee.par ?? undefined,
            yardage: tee.yardage ?? undefined,
            rating: tee.rating,
            slope: tee.slope,
          }
        : undefined,
    course: course ? { name: course.name, slug: course.slug ?? course.name } : undefined,
  };
}
