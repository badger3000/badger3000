import React from 'react'
import InnerBlock from './InnerBlock'
import Footer from './Footer'

const Aside = () => {
  return (
    <aside
      id="header"
      style={{
        backgroundImage:
          'linear-gradient(to left bottom, #000000, #141414, #212021, #2e2d2e, #3b3b3c, #414142, #474849, #4d4e4f, #4d4e4f, #4e4e4f, #4e4e4e, #4e4e4e)',
      }}
    >
      <InnerBlock />
      <Footer />
    </aside>
  )
}

export default Aside
