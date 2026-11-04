export default {
  title: "Topics",
  name: "topics",
  type: "document",
  fields: [
    {
      title: "Title",
      name: "title",
      type: "string",
    },
    {
      // The documents store a colour object ({ hex, hsl, rgb }), so this is a
      // `color` field: the Studio needs the @sanity/color-input plugin.
      title: "Background color",
      name: "backgroundColor",
      type: "color",
    },
    {
      title: "Filter Slug",
      name: "slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 200, // will be ignored if slugify is set
      },
    },
    {
      name: "gridSpan",
      title: "Grid Span",
      type: "string",
      options: {
        list: [
          {title: "1 Column", value: "lg:col-span-1"},
          {title: "2 Columns", value: "lg:col-span-2"},
          {title: "3 Columns", value: "lg:col-span-3"},
        ],
      },
    },
  ],
};
