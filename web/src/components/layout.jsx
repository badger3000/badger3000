import React from 'react'
import '../assets/scss/main.scss'

import Aside from './Aside'

const Layout = ({ children }) => (
  <>
    <Aside />
    {children}
  </>
)

export default Layout
