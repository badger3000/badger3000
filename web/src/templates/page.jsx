import React from 'react'
import Layout from '../components/Layout'
import GraphQLErrorList from '../components/Errors/GraphqlErrorList'

import Hero from '../components/Hero'

export default function Page(props) {
  const { data, errors } = props
  if (errors) {
    return (
      <Layout>
        <GraphQLErrorList errors={errors} />
      </Layout>
    )
  }
  const page = data.sanityPage
  console.log(page)
  const content = (page._rawContent || [])
    .filter((c) => !c.disabled)
    .map((c) => {
      let el = null
      switch (c._type) {
        case 'hero':
          el = <Hero key={c._key} {...c} />
          break

        default:
          el = null
      }
      return el
    })
  return (
    <Layout>
      <div id="main">{content}</div>
    </Layout>
  )
}
