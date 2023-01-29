import React from 'react'

import Aside from './Aside/Aside'

const Layout = ({ children }) => (
  <div className="container mx-auto flex min-h-screen flex-col scroll-smooth md:mr-0 md:flex-row">
    <Aside />
    {children}
  </div>
)

export default Layout
