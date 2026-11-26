// A course and its tees, entered once. Rounds (golfScores) reference the course
// and keep a snapshot of the tee they played. PRD: docs/prd/golf-handicap-and-courses.md
export const golfTee = {
  title: "Tee",
  name: "golfTee",
  type: "object",
  fields: [
    {title: "Name", name: "name", type: "string", description: 'e.g. "Blue", "White", "Combo"', validation: (Rule) => Rule.required()},
    {
      title: "Color",
      name: "color",
      type: "string",
      description: "Drives the swatch on the site.",
      options: {
        list: ["black", "blue", "white", "gold", "red", "green", "silver", "custom"],
      },
    },
    {
      title: "Custom color",
      name: "customColor",
      type: "string",
      description: "Hex, e.g. #1d4ed8",
      hidden: ({parent}) => parent?.color !== "custom",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.parent?.color !== "custom") return true;
          return /^#[0-9a-fA-F]{6}$/.test(value ?? "") ? true : "Use a hex color like #1d4ed8";
        }),
    },
    {
      title: "Gender",
      name: "gender",
      type: "string",
      description: "Courses rate the same tee separately for men and women; enter the set you play.",
      options: {
        list: [
          {title: "Men", value: "M"},
          {title: "Women", value: "F"},
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "M",
      validation: (Rule) => Rule.required(),
    },
    {title: "Par", name: "par", type: "number", description: "Optional; falls back to the course par."},
    {title: "Yardage", name: "yardage", type: "number"},
    {
      title: "Course rating",
      name: "rating",
      type: "number",
      description: "18-hole Course Rating, e.g. 72.4",
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Slope rating",
      name: "slope",
      type: "number",
      description: "18-hole Slope Rating, 55–155",
      validation: (Rule) => Rule.required().min(55).max(155),
    },
    {title: "Front 9 rating", name: "front9Rating", type: "number"},
    {title: "Front 9 slope", name: "front9Slope", type: "number", validation: (Rule) => Rule.min(55).max(155)},
    {title: "Back 9 rating", name: "back9Rating", type: "number"},
    {title: "Back 9 slope", name: "back9Slope", type: "number", validation: (Rule) => Rule.min(55).max(155)},
  ],
  preview: {
    select: {name: "name", gender: "gender", rating: "rating", slope: "slope", yardage: "yardage"},
    prepare: ({name, gender, rating, slope, yardage}) => ({
      title: `${name ?? "Tee"}${gender ? ` (${gender})` : ""}`,
      subtitle: [yardage && `${yardage} yds`, rating != null && slope != null && `${rating}/${slope}`]
        .filter(Boolean)
        .join(" · "),
    }),
  },
};

export default {
  title: "Golf Course",
  name: "golfCourse",
  type: "document",
  fields: [
    {title: "Name", name: "name", type: "string", validation: (Rule) => Rule.required()},
    {title: "Slug", name: "slug", type: "slug", options: {source: "name", maxLength: 96}},
    {title: "Location", name: "location", type: "string", description: 'e.g. "Dewey, AZ"'},
    {title: "Address", name: "address", type: "string"},
    {title: "Phone", name: "phone", type: "string"},
    {
      title: "Access",
      name: "access",
      type: "string",
      options: {list: ["public", "private", "resort", "municipal"]},
    },
    {
      title: "Holes",
      name: "holes",
      type: "number",
      options: {list: [9, 18]},
    },
    {title: "Par", name: "par", type: "number", description: "Course par (a tee can override)."},
    {
      title: "Image",
      name: "image",
      type: "image",
      options: {hotspot: true},
      description: "Landscape, at least 1200 × 520 px.",
      fields: [
        {title: "Alt text", name: "alt", type: "string", validation: (Rule) => Rule.required()},
        {title: "Credit", name: "credit", type: "string", description: "Only for photos that aren't yours."},
      ],
    },
    {title: "Description", name: "description", type: "blockContent", description: "Short; the drawer shows the first block."},
    {title: "Website", name: "website", type: "url"},
    {
      title: "Tees",
      name: "tees",
      type: "array",
      of: [{type: "golfTee"}],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .custom((tees) => {
            const seen = new Set();
            for (const tee of tees ?? []) {
              if (!tee?.name) continue;
              const key = `${tee.gender ?? ""}:${tee.name.trim().toLowerCase()}`;
              if (seen.has(key)) return `Duplicate tee "${tee.name}" for the same gender`;
              seen.add(key);
            }
            return true;
          }),
    },
    {
      title: "Scorecard",
      name: "scorecard",
      type: "array",
      description: "Hole-by-hole card for later; not displayed or used in the maths.",
      of: [
        {
          type: "object",
          name: "golfHole",
          fields: [
            {title: "Hole", name: "hole", type: "number"},
            {title: "Par", name: "par", type: "number"},
            {title: "Stroke index", name: "strokeIndex", type: "number"},
            {
              title: "Yardages by tee",
              name: "yardages",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "teeYardage",
                  fields: [
                    {title: "Tee key", name: "teeKey", type: "string"},
                    {title: "Yards", name: "yards", type: "number"},
                  ],
                },
              ],
            },
          ],
          preview: {select: {title: "hole", subtitle: "par"}, prepare: ({title, subtitle}) => ({title: `Hole ${title}`, subtitle: `Par ${subtitle ?? "–"}`})},
        },
      ],
    },
  ],
  orderings: [{title: "Name (A-Z)", name: "nameAsc", by: [{field: "name", direction: "asc"}]}],
  preview: {
    select: {title: "name", subtitle: "location", media: "image"},
  },
};
