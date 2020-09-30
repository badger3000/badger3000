const path = require(`path`)

module.exports = {
  siteMetadata: {
    title: 'Kyle Ross - Web Developer',
    author: 'Kyle Ross',
    description: 'Personal site of Kyle Ross',
  },
  plugins: [
    'gatsby-plugin-react-helmet',

    {
      resolve: `gatsby-plugin-manifest`,

      options: {
        name: 'gatsby-starter-default',
        short_name: 'starter',
        start_url: './',
        background_color: '#663399',
        theme_color: '#663399',
        display:  'minimal-ui',
        icon: "src/assets/favicons/images/apple-icon.png", // This path is relative to the root of the site.
      },
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: path.join(__dirname, `src`, `assets/images/`),
      },
    },
    'gatsby-plugin-sass',
    'gatsby-plugin-netlify',
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    'gatsby-plugin-offline',
  ],
}
