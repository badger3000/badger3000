import React from 'react'
import Layout from '../components/Layout'

import { useSiteMetadata } from '../components/hooks/site-meta'
const NotFoundPage = () => {
  return (
    <Layout>
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

export function Head() {
  const { title, description } = useSiteMetadata

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
    </>
  )
}
