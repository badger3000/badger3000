import React from 'react'
//import { StaticQuery, graphql } from 'gatsby'
import Image from './Image'
import Footer from './Footer'
//import avatar from '../assets/images/avatar.jpg'

const Header = () => (
  <header id="header">
    <div className="inner">
      <a href="/" className="image avatar">
        <Image filename="avatar.jpg" />
      </a>
      <h1>
        <strong>My name is Kyle Ross</strong>,
        <br />
        Web Developer
        <br />
        Bay Area, CA
      </h1>
    </div>
    <Footer />
  </header>
)

export default Header
