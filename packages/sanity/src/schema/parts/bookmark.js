// schemas/parts/bookmark.js
export default {
  title: "Bookmark",
  name: "bookmark",
  type: "document",
  fields: [
    {
      title: "Title",
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      title: "URL",
      name: "url",
      type: "url",
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Folder",
      name: "folder",
      type: "reference",
      to: [{type: "bookmarkFolder"}],
      validation: (Rule) => Rule.required(),
      description:
        "Select an existing folder or create a new one from the Bookmark Folders list",
    },
  ],
  orderings: [
    {
      title: "Title (A-Z)",
      name: "titleAsc",
      by: [{field: "title", direction: "asc"}],
    },
    {
      title: "Folder",
      name: "folderAsc",
      by: [{field: "folder.name", direction: "asc"}],
      extendedProjection: "folder->name",
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "folder.name",
    },
  },
};
