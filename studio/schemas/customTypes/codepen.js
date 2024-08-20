export default {
  name: 'codepen',
  title: 'CodePens',
  type: 'document',
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
      name: 'codepenTopic',
      type: 'reference',
      to: [{type: 'topics'}],
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
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
  ],
}
