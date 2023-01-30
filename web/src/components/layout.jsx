import React from 'react'

import Aside from './Aside/Aside'

const Layout = ({ children }) => (
  <div className="container flex min-h-screen flex-col scroll-smooth sm:mx-2 lg:mr-0 lg:flex-row">
    <Aside />
    {children}
  </div>
)

export default Layout
