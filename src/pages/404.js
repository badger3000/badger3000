import React from 'react'
import Helmet from 'react-helmet'
import Layout from '../components/layout'

const NotFoundPage = () => {
  const siteTitle = '404 - Sorry, Can not find that content'
  const siteDescription = 'You are looking for content that is not here'
  return (
    <Layout>
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
      </Helmet>
      <div id="main">
        <h1>NOT FOUND</h1>
        <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
      </div>
    </Layout>
  )
}

export default NotFoundPage
