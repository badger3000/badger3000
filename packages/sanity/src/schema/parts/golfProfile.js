// Singleton: the Handicap Index as shown in the GHIN app, for the agreement check.
export default {
  title: "Golf Profile",
  name: "golfProfile",
  type: "document",
  fields: [
    {
      title: "GHIN Handicap Index",
      name: "ghinIndex",
      type: "number",
      description: "The index shown in the GHIN app.",
      validation: (Rule) => Rule.min(-10).max(54),
    },
    {title: "GHIN index date", name: "ghinIndexDate", type: "date", description: "The day that index was effective."},
  ],
  preview: {
    select: {title: "ghinIndex", subtitle: "ghinIndexDate"},
    prepare: ({title, subtitle}) => ({title: `Handicap Index ${title ?? "–"}`, subtitle}),
  },
};
