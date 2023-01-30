import React from 'react'
import { graphql } from 'gatsby'
import { useSiteMetadata } from '../components/Hooks/SiteMeta'
import Page from '../templates/page'
import Errors from '../components/Errors/Errors'

export const data = graphql`
  query Homepage {
    sanityPage(title: { eq: "Homepage" }) {
      id
      _rawContent
      title
    }
  }
`
const HomeIndex = (props) => {
  const { data, errors } = props

  if (errors) {
    return <Errors errors={errors} />
  }

  return <Page data={data} />
}

export default HomeIndex

export function Head() {
  const { title, description } = useSiteMetadata()
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
    </>
  )
}
