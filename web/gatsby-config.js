const isProd = process.env.NODE_ENV === 'production'
const previewEnabled =
  (process.env.GATSBY_IS_PREVIEW || 'false').toLowerCase() === 'true'

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})
module.exports = {
  siteMetadata: {
    title: 'Kyle Ross - Web Developer',
    author: 'Kyle Ross',
    siteUrl: 'https://badger3000.com',
    description:
      'Kyle Ross is a front end developer, based in the Prescott, Arizona',
  },
  plugins: [
    `gatsby-plugin-postcss`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/assets/images/`,
      },
    },
    {
      resolve: `gatsby-source-sanity`,
      options: {
        projectId: process.env.SANITY_PROJECT_ID,
        dataset: process.env.SANITY_DATASET,
        // a token with read permissions is required
        // if you have a private dataset
        token: process.env.SANITY_TOKEN,
        watchMode: !isProd, // watchMode only in dev mode
        overlayDrafts: !isProd || previewEnabled, // drafts in dev & Gatsby Cloud Preview
        // If the Sanity GraphQL API was deployed using `--tag <name>`,
        // use `graphqlTag` to specify the tag name. Defaults to `default`.
        graphqlTag: 'default',
      },
    },
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'Badger3000',
        short_name: 'Badger3000',
        start_url: '/',
        background_color: '#37393d',
        theme_color: '#37393d',
        display: 'standalone',
        icon: 'src/assets/images/website-icon.png',
        icon_options: {
          // For all the options available, please see the additional resources below.
          purpose: `any maskable`,
        },
        orientation: 'portrait', // This path is relative to the root of the site.
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-image`,
    {
      resolve: 'gatsby-plugin-preconnect',
      options: {
        domains: [
          'https://samsungnext.com/',
          'https://www.hotwire.com/hotels/',
          'https://www.sony.co.uk/',
          'https://www.youtube.com/',
          'https://mplsclips.com',
          'https://github.com/',
          'https://www.linkedin.com/',
        ],
      },
    },
  ],
}
