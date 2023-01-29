import React from 'react'

import Aside from './Aside/Aside'

const Layout = ({ children }) => (
  <div
    style={{
      backgroundImage:
        'linear-gradient(to left bottom, #000000, #141414, #212021, #2e2d2e, #3b3b3c, #414142, #474849, #4d4e4f, #4d4e4f, #4e4e4f, #4e4e4e, #4e4e4e)',
    }}
  >
    <div className="container mx-auto flex min-h-screen flex-col md:mr-0 md:flex-row">
      <Aside />
      {children}
    </div>
  </div>
)

export default Layout
