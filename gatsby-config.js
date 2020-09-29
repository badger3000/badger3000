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
        name: 'Badger3000',
        short_name: 'Badger3000',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: [
          {
            src: 'src/assets/images/favicons/android-icon-36x36.png',
            sizes: '36x36',
            type: 'image/png',
            density: '0.75',
          },
          {
            src: 'src/assets/images/favicons/android-icon-48x48.png',
            sizes: '48x48',
            type: 'image/png',
            density: '1.0',
          },
          {
            src: 'src/assets/images/favicons/android-icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            density: '1.5',
          },
          {
            src: 'src/assets/images/favicons/android-icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            density: '2.0',
          },
          {
            src: 'src/assets/images/favicons/android-icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            density: '3.0',
          },
          {
            src: 'src/assets/images/favicons/android-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            density: '4.0',
          },
        ], // This path is relative to the root of the site.
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
