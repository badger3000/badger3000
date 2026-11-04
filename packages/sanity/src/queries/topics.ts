import { defineQuery } from "groq";

/** Browse filters: `FilterChip ← topics[]`. `backgroundColor` is a colour object. */
export const topicsQuery = defineQuery(`*[_type == "topics"] | order(title asc) {
  title,
  "slug": slug.current,
  "backgroundColor": backgroundColor.hex
}`);
