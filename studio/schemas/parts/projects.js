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
      title: 'Listed Order - number',
      name: 'order',
      type: 'number',
    },
    {
      title: 'Tech Stack',
      name: 'tech',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'HTML', value: 'HTML'},
          {title: 'CSS', value: 'CSS'},
          {title: 'SCSS', value: 'SCSS'},
          {title: 'Java', value: 'Java'},
          {title: 'JavaScript', value: 'JavaScript'},
          {title: 'ReactJS', value: 'ReactJs'},
          {title: 'GatsbyJS', value: 'GatsbyJs'},
          {title: 'NodeJS', value: 'nodeJs'},
          {title: 'JQuery', value: 'jQuery'},
          {title: 'TailwindsCSS', value: 'tailwindcss'},
          {title: 'JamStack', value: 'Jamstack'},
          {title: 'HubSpot', value: 'hubspot'},
          {title: 'Netfliy', value: 'netlify'},
          {title: 'Webflow', value: 'Webflow'},
          {title: 'Shopify', value: 'Shopify'},
          {title: 'WordPress', value: 'WordPress'},
          {title: '...more', value: '...more'},
        ],
      },
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
