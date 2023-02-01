import React from 'react'

import Aside from '../Aside/Aside'

const Layout = ({ children }) => (
  <div className="mx-4 flex flex-col scroll-smooth lg:mx-auto lg:flex-row">
    <Aside />
    {children}
  </div>
)

export default Layout
