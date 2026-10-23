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

/** Chat — the agent's `skills` intent: every category, names only. */
export const skillsForChatQuery = defineQuery(`*[_type == "skillCategory"] | order(order asc) {
  "name": coalesce(name, ""), "skills": coalesce(skills[] { "name": coalesce(name, ""), badgeLabel }, [])
}`);
