import { defineQuery } from "groq";

/** Browse — Golf (pen oH8H5): `table · rounds`, newest first. */
export const golfScoresQuery = defineQuery(`*[_type == "golfScores"] | order(date desc) {
  // Bridge: a reference after the migration, a string before it.
  "course": coalesce(course->name, course),
  date,
  score
}`);

/** Chat — the agent's `golf` intent: the newest rounds that have a score, matched on course. */
export const golfScoresForChatQuery = defineQuery(`{
  "total": count(*[_type == "golfScores" && defined(score)]),
  "matched": count(*[_type == "golfScores" && defined(score)
    && (count($q) == 0 || count($q[coalesce(^.course->name, ^.course) match @]) > 0)]),
  "rows": *[_type == "golfScores" && defined(score)
    && (count($q) == 0 || count($q[coalesce(^.course->name, ^.course) match @]) > 0)]
    | order(date desc) [0...$limit] {
    "course": coalesce(course->name, course, "Unknown course"), date, score
  }
}`);
