// schemas/parts/bookmarkFolder.js
export default {
  title: "Bookmark Folder",
  name: "bookmarkFolder",
  type: "document",
  icon: () => "📁",
  fields: [
    {
      title: "Name",
      name: "name",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
  ],
  orderings: [
    {
      title: "Name (A-Z)",
      name: "nameAsc",
      by: [{field: "name", direction: "asc"}],
    },
  ],
  preview: {
    select: {
      title: "name",
    },
  },
};
