/**
 * Copy and options for /contact — pen `oq8cY` (desktop) and `jItDW` (mobile).
 *
 * None of this is in Sanity yet (the pen binds it to `stat (…)`,
 * `method.value`, `note.text`, but the schema has no such fields),
 * so it lives here, in one place, until the schema grows them. GitHub and
 * LinkedIn prefer `settings.links` when the document has them.
 *
 * `TOPICS` and `TIMELINES` are also what `/api/contact` accepts.
 */
export const TOPICS = ["Project", "Collaboration", "Speaking", "Something else"] as const;
export const TIMELINES = ["Next 2 weeks", "This month", "Just exploring"] as const;
export type Topic = (typeof TOPICS)[number];
export type Timeline = (typeof TIMELINES)[number];

export const DEFAULT_TOPIC: Topic = "Project";
export const DEFAULT_TIMELINE: Timeline = "This month";

export const intro =
  "I take on a few product and design-systems projects a year — new builds, rescues, and the occasional second pair of hands.";
/** Two-column layout only: the 1920 design (`Nsfee`) stops after `intro`. */
export const introMore = "The form on the right reaches me directly: nothing automated, nothing shared.";

export const stats = [
  { icon: "clock", value: "24h", label: "Average reply" },
  { icon: "layers", value: "3", label: "Projects at once" },
  { icon: "calendar-days", value: "2018", label: "Shipping since" },
];

export const steps = [
  { title: "You send a note", text: "A few lines on what you are building and why." },
  { title: "I reply within a day", text: "With questions, my availability, and a next step." },
  { title: "We talk", text: "A 30-minute call, or a written proposal if you prefer." },
];

export const note = "Manchester, UK — working across GMT±3.";

export const email = "kyle@badger3000.dev";
export const github = "https://github.com/kyle-ross";
export const linkedin = "https://www.linkedin.com/in/kyleross";
