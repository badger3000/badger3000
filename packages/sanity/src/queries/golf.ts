import { defineQuery } from "groq";
import { IMAGE } from "./fragments.ts";

/**
 * Browse — Golf (pen `oH8H5`): one fetch for the whole page. Rounds come oldest
 * first and in full, because the handicap caps and exceptional-score reductions
 * replay the whole history (apps/web/src/lib/golf.ts); the page shows the last 20.
 * `course` is a reference after the migration and a string before it, so
 * `course->` is null on an unmigrated round and the page renders it as "—".
 */
export const golfPageQuery = defineQuery(`{
  "rounds": *[_type == "golfScores" && defined(score) && defined(date)] | order(date asc, _id asc) {
    _id,
    date,
    score,
    holes,
    nine,
    excluded,
    differential,
    tee { teeKey, name, color, customColor, gender, par, yardage, rating, slope },
    "course": course->{ name, "slug": slug.current }
  },
  "courses": *[_type == "golfCourse"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    location,
    access,
    holes,
    par,
    image ${IMAGE},
    "description": pt::text(description[0]),
    website,
    tees[] { _key, name, color, customColor, gender, par, yardage, rating, slope }
  },
  "profile": *[_type == "golfProfile"][0] { ghinIndex, ghinIndexDate }
}`);

/**
 * Chat — the agent's `golf` intent: the newest rounds that have a score, matched
 * on course name, plus what the WHS engine needs to compute the index on the
 * Worker (`history`: every scored round, slim) and GHIN's own number (`profile`).
 */
export const golfScoresForChatQuery = defineQuery(`{
  "total": count(*[_type == "golfScores" && defined(score)]),
  "matched": count(*[_type == "golfScores" && defined(score)
    && (count($q) == 0 || count($q[coalesce(^.course->name, ^.course) match @]) > 0)]),
  "rows": *[_type == "golfScores" && defined(score)
    && (count($q) == 0 || count($q[coalesce(^.course->name, ^.course) match @]) > 0)]
    | order(date desc) [0...$limit] {
    "course": coalesce(course->name, course, "Unknown course"), date, score
  },
  "history": *[_type == "golfScores" && defined(score) && defined(date)] | order(date asc) {
    "id": _id, date, score, differential, excluded, holes,
    "tee": tee{teeKey, name, color, gender, par, yardage, rating, slope},
    "course": coalesce(course->name, course)
  },
  "profile": *[_type == "golfProfile"][0]{ghinIndex, ghinIndexDate}
}`);
