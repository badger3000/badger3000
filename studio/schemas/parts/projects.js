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
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'HTML', value: 'html'},
          {title: 'CSS', value: 'css'},
          {title: 'SCSS', value: 'scss'},
          {title: 'Java', value: 'java'},
          {title: 'JavaScript', value: 'javascript'},
          {title: 'ReactJS', value: 'reacjs'},
          {title: 'GatsbyJS', value: 'gatsbyjs'},
          {title: 'NodeJS', value: 'nodejs'},
          {title: 'JQuery', value: 'jquery'},
          {title: 'TailwindsCSS', value: 'tailwindcss'},
          {title: 'JamStack', value: 'jamstack'},
          {title: 'HubSpot', value: 'hubspot'},
          {title: 'Netfliy', value: 'netlify'},
          {title: 'Webflow', value: 'webflow'},
          {title: 'Shopify', value: 'shopify'},
          {title: 'WordPress', value: 'wordpress'},
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
