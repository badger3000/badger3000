import { defineQuery } from "groq";
import { IMAGE } from "./fragments.ts";

/** Browse — Experience (pen QTqA7): timeline plus education. */
export const experienceQuery = defineQuery(`*[_type == "experience"] | order(startDate desc) {
  title,
  company,
  companyUrl,
  location,
  startDate,
  endDate,
  description,
  order,
  "logo": logo ${IMAGE}
}`);

export const educationQuery = defineQuery(`*[_type == "education"] | order(startDate desc) {
  degree,
  institution,
  institutionUrl,
  location,
  startDate,
  endDate,
  description,
  order,
  "logo": logo ${IMAGE}
}`);

/** Chat — the agent's `experience` intent, in the shape it shares with education. */
export const experienceForChatQuery = defineQuery(`*[_type == "experience"] | order(startDate desc) [0...8] {
  title, "org": company, "loc": location, startDate, endDate, description, "url": companyUrl
}`);

/** Chat — the agent's `education` intent. */
export const educationForChatQuery = defineQuery(`*[_type == "education"] | order(startDate desc) [0...8] {
  "title": degree, "org": institution, startDate, endDate, description, "url": institutionUrl
}`);
