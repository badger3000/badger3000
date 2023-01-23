import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'

import { convertToBgImage } from 'gbimage-bridge'
import BackgroundImage from 'gatsby-background-image'
// Note: You can change "images" to whatever you'd like.

export default function Image(props) {
  return (
    <StaticQuery
      query={graphql`
        {
          images: allFile {
            edges {
              node {
                publicURL
                relativePath
                name
                childImageSharp {
                  gatsbyImageData(width: 600, layout: CONSTRAINED)
                }
              }
            }
          }
        }
      `}
      render={(data) => {
        const image = data.images.edges.find((n) => {
          return n.node.relativePath.includes(props.filename)
        })
        if (!image) {
          return null
        }

        return (
          <GatsbyImage
            image={image.node.childImageSharp.gatsbyImageData}
            loading="eager"
            fit="cover"
            alt={props.alt}
            style={{ position: 'revert' }}
          />
        )
      }}
    />
  )
}
export const BackgroundImages = (props, { children }) => {
  return (
    <StaticQuery
      query={graphql`
        {
          images: allFile {
            edges {
              node {
                publicURL
                relativePath
                name
                childImageSharp {
                  gatsbyImageData(width: 600, layout: CONSTRAINED)
                }
              }
            }
          }
        }
      `}
      render={(data) => {
        const image = data.images.edges.find((n) => {
          return n.node.relativePath.includes(props.filename)
        })
        if (!image) {
          return null
        }

        // Use like this:
        const bgImage = convertToBgImage(image)
        return (
          <BackgroundImage
            Tag="section"
            // Spread bgImage into BackgroundImage:
            {...bgImage}
            preserveStackingContext
          >
            {children}
          </BackgroundImage>
        )
      }}
    />
  )
}
