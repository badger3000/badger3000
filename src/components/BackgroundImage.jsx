import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import { getImage } from 'gatsby-plugin-image'

import { convertToBgImage } from 'gbimage-bridge'
import BackgroundImage from 'gatsby-background-image'

export default function BackgroundImages(props) {
  const data = useStaticQuery(graphql`
    query Images {
      allFile(filter: { sourceInstanceName: { eq: "images" } }) {
        edges {
          node {
            name
            childImageSharp {
              gatsbyImageData(width: 600, layout: CONSTRAINED)
            }
            publicURL
            relativePath
          }
        }
      }
    }
  `)
  const images = data.allFile.edges.find((n) => {
    return n.node.relativePath.includes(props.filename)
  })
  if (!images) {
    return null
  }
  const image = getImage(images.node.childImageSharp.gatsbyImageData)
  const bgImage = convertToBgImage(image)

  return (
    <BackgroundImage
      Tag={props.tag}
      id={props.id}
      {...bgImage}
      backgroundColor={`#040e18`}
    >
      {props.children}
    </BackgroundImage>
  )
}
