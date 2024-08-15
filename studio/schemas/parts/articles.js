export default {
  title: 'Articles',
  name: 'articles',
  type: 'document',
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
  ],
}
