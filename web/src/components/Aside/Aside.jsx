import React from 'react'
import InnerBlock from '../InnerBlock'
import Footer from '../Footer'

const Aside = () => {
  return (
    <aside id="header" className="relative basis-3/12 md:mt-2 md:mr-2">
      <section className="sticky top-4 flex min-h-screen flex-col content-between">
        <InnerBlock />
        <Footer />
      </section>
    </aside>
  )
}

export default Aside
