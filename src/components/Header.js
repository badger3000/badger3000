import React from 'react'

import Footer from './Footer'
import avatar from '../assets/images/avatar.jpg'

const Header = () => (
  <header id="header">
    <div className="inner">
      <a href="https://www.linkedin.com/in/badger816/" className="image avatar">
        <img src={avatar} alt="" />
      </a>
      <h1>
        <strong>My name is Kyle Ross</strong>,
        <br />
        Front-end web developer
        <br />
        located in the Bay Area
      </h1>
    </div>
    <Footer />
  </header>
)

export default Header
