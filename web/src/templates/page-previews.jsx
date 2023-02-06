import React from 'react'
import { graphql } from 'gatsby'
import GraphQLErrorList from '../components/Errors/GraphqlErrorList'
import Layout from '../components/Layout/Layout'

import Hero from '../components/Hero/Hero'
import ProjectComponent from '../components/ProjectComponent/ProjectComponent'
import Contact from '../components/Contact/Contact'

export const data = graphql`
  query PreviewPageQuery($id: String!) {
    page: sanityPage(id: { eq: $id }) {
      title
      _rawContent
    }
  }
`
const PreviewPages = (props) => {
  const { data = {}, errors } = props
  const { _rawContent } = data.page || {}
  const content = (_rawContent || [])
    .filter((c) => !c.disabled)
    .map((c) => {
      let el = null
      switch (c._type) {
        case 'hero':
          el = <Hero key={c._key} {...c} />
          break
        case 'projectComponent':
          el = <ProjectComponent key={c._key} {...c} />
          break
        case 'contactForm':
          el = <Contact key={c._key} {...c} />
          break

        default:
          el = null
      }
      return el
    })
  return (
    <Layout>
      <main className="main">
        {errors && <GraphQLErrorList errors={errors} />}
        {content}
      </main>
    </Layout>
  )
}

export default PreviewPages
