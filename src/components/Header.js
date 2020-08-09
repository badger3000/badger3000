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
            fluid(quality: 100) {
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
    </BackgroundImage>
  )
}

export default Header
