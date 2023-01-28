import React from 'react'
import InnerBlock from '../InnerBlock'
import Footer from '../Footer'

const Aside = () => {
  return (
    <aside id="header" className="relative basis-3/12 md:mt-2 md:mr-2">
      <div className="sticky top-6 flex flex-col flex-wrap  pb-11 text-center align-middle md:min-h-screen">
        <InnerBlock />
        <Footer />
      </div>
    </aside>
  )
}

export default Aside
