import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import Image from './Image'
import Footer from './Footer'
import BackgroundImage from 'gatsby-background-image'
const Header = ({ className }) => {
  const { photo, blackBg } = useStaticQuery(
    graphql`
      query {
        photo: file(relativePath: { eq: "bg.jpg" }) {
          childImageSharp {
            fluid(quality: 100) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
        blackBg: file(relativePath: { eq: "overlay.png" }) {
          childImageSharp {
            fluid(quality: 80) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
      }
    `
  )
  const backgroundFluidImageStack = [
    photo.childImageSharp.fluid,
    blackBg.childImageSharp.fluid,
  ].reverse()
  return (
    <BackgroundImage
      Tag="header"
      className={className}
      fluid={backgroundFluidImageStack}
      id="header"
      style={{ position: 'inhert' }}
    >
      <div className="inner">
        <a href="/" className="image avatar" style={{ display: 'inline-block', width: '100px', height: '100px' }}>
          <Image filename="avatar.jpg" alt="Kyle Ross profile picture"/>
        </a>
        <h1>
          <strong>Kyle Ross</strong>
        </h1>
        <p style={{ marginBottom: 0, fontSize: '1.5em' }}>Web Developer</p>
        <p style={{ marginBottom: 0, fontSize: '1.5em' }}>Bay Area, CA</p>
      </div>
      <Footer />
    </BackgroundImage>
  )
}

export default Header
