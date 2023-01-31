import React from 'react'
import Layout from '../components/Layout'
import { useSiteMetadata } from '../components/Hooks/SiteMeta'

const NotFoundPage = () => {
  return (
    <Layout>
      <main
        id="main"
        className="min-h-screen basis-auto flex-col rounded-tl-lg rounded-tr-lg bg-white px-4 pt-6 pb-11 lg:basis-9/12 lg:rounded-none lg:px-16"
      >
        <h1>NOT FOUND</h1>
        <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
        <a href="/" className="button">
          Back to Home
        </a>
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
