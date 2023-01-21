import React from 'react'
import Layout from '../components/layout'

const NotFoundPage = () => {
  return (
    <Layout>
      <div id="main">
        <h1>NOT FOUND</h1>
        <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
        <a href="/" className="button">
          Back to Home
        </a>
      </div>
    </Layout>
  )
}

export default NotFoundPage

export function Head() {
  const siteTitle = '404 - Sorry, Can not find that content'
  const siteDescription = 'You are looking for content that is not here'
  return (
    <>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
    </>
  )
}
