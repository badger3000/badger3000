import React from 'react'
import { Link } from 'gatsby'
import Image from './Image'
import Footer from './Footer'
const Header = ({ className }) => {
  return (
    <>
      <header id="header" className={className} style={{ position: 'inhert' }}>
        <div className="inner">
          <Link
            to="/"
            className="image avatar"
            style={{ display: 'inline-block', width: '100px', height: '100px' }}
          >
            <Image filename="avatar.jpg" alt="Kyle Ross profile picture" />
          </Link>
          <h1>
            <strong>Kyle Ross</strong>
          </h1>
          <p style={{ marginBottom: 0, fontSize: '1.5em' }}>Web Developer</p>
          <p style={{ marginBottom: 0, fontSize: '1.5em' }}>Prescott, AZ</p>
        </div>
        <Footer />
      </header>
    </>
  )
}

export default Header
