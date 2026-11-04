import { defineQuery } from "groq";

/**
 * Browse — Skills (pen NH0XZ); `skills[]` is an inline array, so flatten it.
 * `badgeColor` is stored bare ("777BB4"), but the pen binds it straight to a
 * `fill`, so it leaves here CSS-ready.
 */
export const skillsQuery = defineQuery(`*[_type == "skillCategory"] | order(order asc) {
  name,
  order,
  "skills": skills[] {
    name,
    badgeType,
    badgeLabel,
    "badgeColor": select(
      badgeColor == null => null,
      string::startsWith(badgeColor, "#") => badgeColor,
      true => "#" + badgeColor
    )
  }
}`);

/**
 * Chat — the agent's `skills` intent: the categories whose name or any skill
 * matches `$q` (every category when `$q` is empty), names only. `total` and
 * `matched` count categories.
 */
export const skillsForChatQuery = defineQuery(`{
  "total": count(*[_type == "skillCategory"]),
  "matched": count(*[_type == "skillCategory"
    && (count($q) == 0 || count($q[[^.name, ...coalesce(^.skills[].name, []), ...coalesce(^.skills[].badgeLabel, [])] match @]) > 0)]),
  "rows": *[_type == "skillCategory"
    && (count($q) == 0 || count($q[[^.name, ...coalesce(^.skills[].name, []), ...coalesce(^.skills[].badgeLabel, [])] match @]) > 0)]
    | order(order asc) [0...$limit] {
    "name": coalesce(name, ""), "skills": coalesce(skills[] { "name": coalesce(name, ""), badgeLabel }, [])
  }
}`);
