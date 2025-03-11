export default {
  name: 'codepen',
  title: 'CodePens',
  type: 'document',
  groups: [
    {
      title: 'Card Layout',
      name: 'cardLayout',
    },
  ],
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      title: 'Topic',
      name: 'topic',
      type: 'reference',
      to: [{type: 'topics'}],
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{type: 'block'}],
    },
    {
      name: 'penUrl',
      title: 'CodePen URL',
      type: 'url',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'embedCode',
      title: 'Embed Code',
      type: 'text',
      description: 'Paste the CodePen embed code here',
    },
    {
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {
        hotspot: true, // Enables UI for selecting focal point of the image
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
          {title: 'Center', value: 'lg:bg-center'},
        ],
      },
    },
  ],
}
