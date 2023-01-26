import React from 'react'
import InnerBlock from './InnerBlock'
import Footer from './Footer'

const Aside = () => {
  return (
    <aside id="header" className="basis-3/12 flex-col md:mt-2 md:mr-2">
      <InnerBlock />
      <Footer />
    </aside>
  )
}

export default Aside
