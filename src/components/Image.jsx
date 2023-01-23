import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
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
