import React from 'react'
import Layout from '../components/Layout/Layout'
import { Link } from 'gatsby'

import { useSiteMetadata } from '../components/Hooks/SiteMeta'
const NotFoundPage = () => {
  return (
    <Layout>
      <div id="main" className="main text-center lg:items-center">
        <section className="h-auto ">
          <h1 className=" mb-6 text-4xl lg:text-6xl">
            Your message was received
          </h1>
          <p className=" text-lg">
            Thanks for contacting me, will be in touch soon
          </p>
          <Link to="/" className="button">
            Back to Home
          </Link>
        </section>
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
