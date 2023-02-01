import React from 'react'
import { Link } from 'gatsby'
import Layout from '../components/Layout/Layout'
import { useSiteMetadata } from '../components/Hooks/SiteMeta'

const NotFoundPage = () => {
  return (
    <Layout>
      <main id="main" className="main items-center text-center">
        <h1 className="mb-6 text-6xl">NOT FOUND</h1>
        <p className="text-lg">
          You just hit a route that doesn&#39;t exist... the sadness.
        </p>
        <Link to="/" className="button">
          Back to Home
        </Link>
      </main>
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
