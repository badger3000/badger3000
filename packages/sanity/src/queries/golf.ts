import { defineQuery } from "groq";

/** Browse — Golf (pen oH8H5): `table · rounds`, newest first. */
export const golfScoresQuery = defineQuery(`*[_type == "golfScores"] | order(date desc) {
  course,
  date,
  score
}`);

/** Chat — the agent's `golf` intent: the 10 newest rounds that have a score. */
export const golfScoresForChatQuery = defineQuery(`*[_type == "golfScores" && defined(score)] | order(date desc) [0...10] {
  "course": coalesce(course, "Unknown course"), date, score
}`);
