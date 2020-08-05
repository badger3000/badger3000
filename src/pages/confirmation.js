import React from 'react'
import Helmet from 'react-helmet'
import Layout from '../components/layout'

const NotFoundPage = () => {
  const siteTitle = 'Thank you for contacting me'
  const siteDescription = 'Your submission is confirmed'
  return (
    <Layout>
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
      </Helmet>
      <div id="main">
        <h1>Thanks for Contacting Me</h1>
        <p>Will be in touch soon</p>
        <a href="/" className="button">
          Back to Home
        </a>
      </div>
    </Layout>
  )
}

export default NotFoundPage
