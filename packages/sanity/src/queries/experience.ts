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

/**
 * Chat — the agent's `experience` intent, in the shape it shares with
 * education: matched on title, company, location and description.
 */
export const experienceForChatQuery = defineQuery(`{
  "total": count(*[_type == "experience"]),
  "matched": count(*[_type == "experience"
    && (count($q) == 0 || count($q[[^.title, ^.company, ^.location, ^.description] match @]) > 0)]),
  "rows": *[_type == "experience"
    && (count($q) == 0 || count($q[[^.title, ^.company, ^.location, ^.description] match @]) > 0)]
    | order(startDate desc) [0...$limit] {
    title, "org": company, "loc": location, startDate, endDate, description, "url": companyUrl
  }
}`);

/** Chat — the agent's `education` intent: matched on degree and institution. */
export const educationForChatQuery = defineQuery(`{
  "total": count(*[_type == "education"]),
  "matched": count(*[_type == "education"
    && (count($q) == 0 || count($q[[^.degree, ^.institution] match @]) > 0)]),
  "rows": *[_type == "education"
    && (count($q) == 0 || count($q[[^.degree, ^.institution] match @]) > 0)]
    | order(startDate desc) [0...$limit] {
    "title": degree, "org": institution, startDate, endDate, description, "url": institutionUrl
  }
}`);
