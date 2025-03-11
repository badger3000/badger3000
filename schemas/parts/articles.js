export default {
  title: 'Articles',
  name: 'articles',
  type: 'document',
  groups: [
    {
      title: 'Card Layout',
      name: 'cardLayout',
    },
  ],
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string',
    },
    {
      title: 'Slug',
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 200, // will be ignored if slugify is set
      },
    },
    {
      title: 'Topic',
      name: 'topic',
      type: 'reference',
      to: [{type: 'topics'}],
    },
    {
      title: 'Content',
      name: 'content',
      type: 'array',
      of: [{type: 'block'}],
    },
    {
      title: 'Excerpt',
      name: 'excerpt',
      type: 'string',
      description: 'Short Description of the article',
      validation: (Rule) => Rule.max(200).warning(`A title shouldn't be more than 120 characters.`),
    },
    {
      title: 'Main Image',
      name: 'main_image',
      type: 'image',
      options: {
        hotspot: false, // <-- Defaults to false
      },
      fields: [
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
          options: {
            collapsible: true, // <-- make this field easily accessible
          },
        },
        {
          // Editing this field will be hidden behind an "Edit"-button
          name: 'attribution',
          type: 'string',
          title: 'Attribution',
        },
        {
          name: 'category',
          type: 'postCategories',
        },
      ],
    },
    {
      name: 'gridSpan',
      title: 'Grid Span',
      type: 'string',
      group: 'cardLayout',
      options: {
        list: [
          {title: '1 Column', value: 'lg:col-span-1'},
          {title: '2 Columns', value: 'lg:col-span-2'},
          {title: '3 Columns', value: 'lg:col-span-3'},
        ],
      },
    },
    {
      name: 'layout',
      title: 'Layout',
      type: 'string',
      group: 'cardLayout',
      options: {
        list: [
          {title: 'Row', value: 'lg:flex-row'},
          {title: 'Column', value: 'lg:flex-col'},
        ],
      },
    },
    {
      name: 'showButton',
      title: 'Show Button?',
      group: 'cardLayout',
      type: 'boolean',
    },
    {
      name: 'imagePosition',
      title: 'Image Position',
      type: 'string',
      group: 'cardLayout',
      options: {
        list: [
          {title: 'Top', value: 'lg:bg-top'},
          {title: 'Top Right', value: 'lg:bg-right-top'},
          {title: 'Top Left', value: 'lg:bg-left-top'},
          {title: 'Bottom', value: 'lg:bg-bottom'},
          {title: 'Bottom Right', value: 'lg:bg-right-bottom'},
          {title: 'Bottom Left', value: 'lg:bg-left-bottom'},
          {title: 'Right', value: 'lg:bg-right'},
          {title: 'Left', value: 'lg:bg-left'},
          {title: 'Center', value: 'lg:bg-center'},
        ],
      },
    },
    {
      name: 'imageSize',
      title: 'Image Size',
      type: 'string',
      group: 'cardLayout',
      options: {
        list: [
          {title: '75%', value: 'lg:bg-75%'},
          {title: '50%', value: 'lg:bg-50%'},
          {title: '25%', value: 'lg:bg-25%'},
        ],
      },
    },
  ],
}
