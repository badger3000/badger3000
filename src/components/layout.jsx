import React from 'react'
import '../assets/scss/main.scss'

import Header from './Header'

const Template = ({ children }) => (
  <>
    <Header />
    {children}
  </>
)

export default Template
