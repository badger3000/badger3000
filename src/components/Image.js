import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'

// Note: You can change "images" to whatever you'd like.

const Image = (props) => (
  <StaticQuery
    query={graphql`
      {
        images: allFile {
          edges {
            node {
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
          alt={props.alt}
          style={{ position: 'inhert' }}
        />
      )
    }}
  />
)

export default Image
