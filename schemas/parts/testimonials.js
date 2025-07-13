// schemas/parts/testimonials.js
export default {
  title: "Testimonials",
  name: "testimonial",
  type: "document",
  fields: [
    {
      title: "Person Name",
      name: "name",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Job Title/Role",
      name: "role",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Company",
      name: "company",
      type: "string",
    },
    {
      title: "LinkedIn/Profile URL",
      name: "profileUrl",
      type: "url",
    },
    {
      title: "Photo",
      name: "photo",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Testimonial Content",
      name: "content",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
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
      description: "Show in main testimonials carousel",
      initialValue: true,
    },
    {
      title: "Date Given",
      name: "dateGiven",
      type: "date",
      description: "When was this testimonial given?",
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
      by: [{field: "dateGiven", direction: "desc"}],
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "photo",
    },
  },
};
