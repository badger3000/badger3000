export default {
  title: 'Projects',
  name: 'projects',
  type: 'document',
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string',
    },
    {
      title: 'Website URL',
      name: 'web_url',
      type: 'url',
    },
    {
      title: 'Tech Stack',
      name: 'tech',
      type: 'string',
    },
    {
      title: 'Project Description',
      name: 'project_description',
      type: 'array',
      of: [{type: 'block'}],
    },
    {
      title: 'Project Image',
      name: 'project_image',
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
      ],
    },
  ],
}
