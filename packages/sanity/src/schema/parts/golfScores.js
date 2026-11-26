import TeePicker from "../components/TeePicker";
import DifferentialInput from "../components/DifferentialInput";
import {API_VERSION} from "../../index";

export default {
  title: "Golf Scores",
  name: "golfScores",
  type: "document",
  fields: [
    {
      title: "Course",
      name: "course",
      type: "reference",
      to: [{type: "golfCourse"}],
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Tees",
      name: "tee",
      type: "object",
      description: "Copied from the course when you pick it, so re-rating a course never changes an old round.",
      components: {input: TeePicker},
      fields: [
        {name: "teeKey", type: "string", title: "Tee key"},
        {name: "name", type: "string", title: "Name"},
        {name: "color", type: "string", title: "Color"},
        {name: "customColor", type: "string", title: "Custom color"},
        {name: "gender", type: "string", title: "Gender"},
        {name: "par", type: "number", title: "Par"},
        {name: "yardage", type: "number", title: "Yardage"},
        {name: "rating", type: "number", title: "Rating"},
        {name: "slope", type: "number", title: "Slope", validation: (Rule) => Rule.min(55).max(155)},
      ],
      // Required for new rounds; migrated rounds without a tee stay valid if they have a differential.
      // A picked tee must still be one of the selected course's tees (drafts + published).
      validation: (Rule) =>
        Rule.custom(async (tee, context) => {
          const doc = context.document;
          if (!tee?.teeKey) {
            if (doc?.score == null || doc?.differential != null) return true;
            return "Pick the tee played, or enter the differential";
          }
          const courseId = doc?.course?._ref?.replace(/^drafts\./, "");
          if (!courseId) return "Pick a course first";
          const tees = await context
            .getClient({apiVersion: API_VERSION})
            .fetch(`coalesce(*[_id == "drafts." + $id][0].tees, *[_id == $id][0].tees)`, {id: courseId}, {perspective: "raw"});
          return (tees ?? []).some((t) => t._key === tee.teeKey)
            ? true
            : "This tee is not on the selected course. Pick one again.";
        }),
    },
    {title: "Date", name: "date", type: "date", options: {}},
    {
      title: "Score",
      name: "score",
      type: "number",
      description: "Gross score.",
      validation: (Rule) => Rule.min(1),
    },
    {
      title: "Adjusted gross score",
      name: "adjustedScore",
      type: "number",
      description: "Optional: GHIN's adjusted gross score (net double bogey).",
    },
    {
      title: "Differential",
      name: "differential",
      type: "number",
      description: "Copy from the GHIN app: Scores → tap the round → Differential",
      components: {input: DifferentialInput},
      validation: (Rule) => Rule.custom((value, context) => {
        if (value == null && context.document?.score != null && !context.document?.tee?.teeKey) {
          return "Enter the differential, or pick a tee so it can be estimated";
        }
        return true;
      }),
    },
    {
      title: "Holes",
      name: "holes",
      type: "number",
      options: {list: [9, 18], layout: "radio", direction: "horizontal"},
      initialValue: 18,
      description: "For 9 holes, enter GHIN's combined 18-hole differential.",
    },
    {
      title: "Nine",
      name: "nine",
      type: "string",
      options: {list: ["front", "back"], layout: "radio", direction: "horizontal"},
      hidden: ({document}) => document?.holes !== 9,
    },
    {
      title: "Score type",
      name: "scoreType",
      type: "string",
      options: {
        list: [
          {title: "Home", value: "home"},
          {title: "Away", value: "away"},
          {title: "Competition", value: "competition"},
        ],
      },
    },
    {
      title: "Excluded",
      name: "excluded",
      type: "boolean",
      description: "Rounds GHIN didn't accept (practice, not posted): kept for the record, left out of the index.",
      initialValue: false,
    },
  ],
  preview: {
    select: {
      score: "score",
      course: "course.name",
      tee: "tee.name",
      date: "date",
    },
    prepare: ({score, course, tee, date}) => ({
      title: score != null ? String(score) : "No score",
      subtitle: [course, tee, date].filter(Boolean).join(" · "),
    }),
  },
  orderings: [
    {
      title: "Post Date - First",
      name: "scoresOrderAsc",
      by: [{field: "date", direction: "asc"}],
    },
    {
      title: "Post Date - Last",
      name: "scoresOrderDesc",
      by: [{field: "date", direction: "desc"}],
    },
  ],
};
