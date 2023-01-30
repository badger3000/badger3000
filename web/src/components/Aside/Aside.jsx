import React from 'react'
import InnerBlock from '../InnerBlock'
import Footer from '../Footer'

const Aside = () => {
  return (
    <aside
      id="header"
      className="relative basis-auto md:mt-2 md:mr-2 lg:basis-3/12"
    >
      <div className="sticky top-6 flex flex-col flex-wrap pt-6 pb-6 text-center align-middle lg:min-h-screen">
        <InnerBlock />
        <Footer />
      </div>
    </aside>
  )
}

export default Aside
