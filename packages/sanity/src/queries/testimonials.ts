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

/** Chat — the agent's `testimonials` intent: the first 5. */
export const testimonialsForChatQuery = defineQuery(`*[_type == "testimonial"] | order(order asc) [0...5] {
  "name": coalesce(name, "Anonymous"), role, company, content, profileUrl
}`);
