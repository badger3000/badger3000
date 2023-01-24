import React from 'react'
import Layout from '../components/layout'
import { useSiteMetadata } from '../components/hooks/site-meta'

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
  const { title, description } = useSiteMetadata()

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
    </>
  )
}
