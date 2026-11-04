import { defineQuery } from "groq";
import { IMAGE } from "./fragments.ts";

/** Browse — Testimonials (pen xTK4z). */
export const testimonialsQuery = defineQuery(`*[_type == "testimonial"] | order(order asc) {
  name,
  role,
  company,
  profileUrl,
  content,
  order,
  featured,
  "photo": photo ${IMAGE}
}`);

/** Chat — the agent's `testimonials` intent: matched on name, role and company. */
export const testimonialsForChatQuery = defineQuery(`{
  "total": count(*[_type == "testimonial"]),
  "matched": count(*[_type == "testimonial"
    && (count($q) == 0 || count($q[[^.name, ^.role, ^.company] match @]) > 0)]),
  "rows": *[_type == "testimonial"
    && (count($q) == 0 || count($q[[^.name, ^.role, ^.company] match @]) > 0)]
    | order(order asc) [0...$limit] {
    "name": coalesce(name, "Anonymous"), role, company, content, profileUrl
  }
}`);
