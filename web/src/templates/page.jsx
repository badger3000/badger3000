import React from 'react'
import Layout from '../components/Layout/Layout'
import GraphQLErrorList from '../components/Errors/GraphqlErrorList'

import Hero from '../components/Hero/Hero'
import ProjectComponent from '../components/ProjectComponent/ProjectComponent'
import Contact from '../components/Contact/Contact'

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

  const content = (page._rawContent || [])
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
        {content}
        <div className="flex justify-center">
          <span className="block pt-4">&copy; Badger3000</span>
        </div>
      </main>
    </Layout>
  )
}
