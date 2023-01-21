import React from 'react'
import Layout from '../components/layout'

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
  const siteTitle = 'Thank you for contacting me'
  const siteDescription = 'Your submission is confirmed'
  return (
    <>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
    </>
  )
}
