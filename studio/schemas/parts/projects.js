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
          {title: 'HTML', value: 'html5'},
          {title: 'CSS', value: 'css3'},
          {title: 'SASS', value: 'sass'},
          {title: 'Java', value: 'java'},
          {title: 'JavaScript', value: 'js'},
          {title: 'ReactJS', value: 'react'},
          {title: 'GatsbyJS', value: 'gatsbyJs'},
          {title: 'NodeJS', value: 'node-js'},
          {title: 'JQuery', value: 'jQuery'},
          {title: 'PHP', value: 'php'},
          {title: 'TailwindsCSS', value: 'tailwindcss'},
          {title: 'JamStack', value: 'jamstack'},
          {title: 'HubSpot', value: 'hubspot'},
          {title: 'Netfliy', value: 'netlify'},
          {title: 'Webflow', value: 'webflow'},
          {title: 'docker', value: 'docker'},
          {title: 'GCloud', value: 'gCloud'},
          {title: 'AWS', value: 'aws'},
          {title: 'Liquid', value: 'liquid'},
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
    {
      name: 'gridSpan',
      title: 'Grid Span',
      type: 'string',
      options: {
        list: [
          {title: '1 Column', value: 'lg:col-span-1'},
          {title: '2 Columns', value: 'lg:col-span-2'},
          {title: '3 Columns', value: 'lg:col-span-3'},
        ],
      },
    },
  ],
  orderings: [
    {
      title: 'Project Order - First',
      name: 'prjectOrderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
    {
      title: 'Project Order - Last',
      name: 'prjectOrderDesc',
      by: [{field: 'order', direction: 'desc'}],
    },
  ],
}
