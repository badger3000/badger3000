module.exports = {
  siteMetadata: {
    title: 'Kyle Ross - Web Developer',
    author: 'Kyle Ross',
    description: 'Personal site of Kyle Ross',
  },
  plugins: [
   
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/assets/images/`,
      },
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'Badger3000',
        short_name: 'Badger3000',
        start_url: '/',
        background_color: '#49bf9d',
        theme_color: '#49bf9d',
        display: 'standalone',
        icon: 'src/assets/images/website-icon.png',
        icon_options: {
          // For all the options available, please see the additional resources below.
          purpose: `any maskable`,
        },
        orientation: 'portrait', // This path is relative to the root of the site.
      },
    },
    {
      resolve: 'gatsby-plugin-preconnect',
      options: {
        domains: [
          'https://samsungnext.com/',
          'https://www.hotwire.com/hotels/',
          'https://www.sony.co.uk/',
          'https://www.youtube.com/',
          'https://github.com/',
          'https://www.linkedin.com/',
        ],
      },
    },
   
    'gatsby-plugin-sass',
    //'gatsby-plugin-offline',
  ],
}
