// schemas/parts/education.js
export default {
  title: "Education",
  name: "education",
  type: "document",
  fields: [
    {
      title: "Degree/Program",
      name: "degree",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Institution",
      name: "institution",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Institution URL",
      name: "institutionUrl",
      type: "url",
    },
    {
      title: "Location",
      name: "location",
      type: "string",
    },
    {
      title: "Start Date",
      name: "startDate",
      type: "string",
      description: 'e.g., "Jan 2000"',
    },
    {
      title: "End Date",
      name: "endDate",
      type: "string",
      description: 'e.g., "Dec 2002"',
    },
    {
      title: "Description",
      name: "description",
      type: "text",
      rows: 3,
    },
    {
      title: "Institution Logo",
      name: "logo",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      title: "Display Order",
      name: "order",
      type: "number",
      description: "Lower numbers appear first",
    },
  ],
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{field: "order", direction: "asc"}],
    },
  ],
  preview: {
    select: {
      title: "degree",
      subtitle: "institution",
      media: "logo",
    },
  },
};
