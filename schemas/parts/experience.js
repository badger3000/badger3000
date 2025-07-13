// schemas/parts/experience.js
export default {
  title: "Work Experience",
  name: "experience",
  type: "document",
  fields: [
    {
      title: "Job Title",
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Company",
      name: "company",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Company URL",
      name: "companyUrl",
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
      description: 'e.g., "2021" or "Jan 2021"',
    },
    {
      title: "End Date",
      name: "endDate",
      type: "string",
      description: 'e.g., "2024" or "Present"',
    },
    {
      title: "Description",
      name: "description",
      type: "text",
      rows: 4,
    },
    {
      title: "Company Logo",
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
    {
      title: "Featured",
      name: "featured",
      type: "boolean",
      description: "Show on homepage experience section",
      initialValue: false,
    },
  ],
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{field: "order", direction: "asc"}],
    },
    {
      title: "Date (Newest First)",
      name: "dateDesc",
      by: [{field: "startDate", direction: "desc"}],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "company",
      media: "logo",
    },
  },
};
