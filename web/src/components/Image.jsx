import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
// Note: You can change "images" to whatever you'd like.

export default function Image(props) {
  const data = useStaticQuery(graphql`
    query Images {
      allFile(filter: { sourceInstanceName: { eq: "images" } }) {
        edges {
          node {
            name
            childImageSharp {
              gatsbyImageData(
                width: 600
                layout: CONSTRAINED
                placeholder: DOMINANT_COLOR
              )
            }
            publicURL
            relativePath
          }
        }
      }
    }
  `)
  const image = data.allFile.edges.find((n) => {
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
}
