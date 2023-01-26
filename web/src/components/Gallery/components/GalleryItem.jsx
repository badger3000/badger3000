import React from 'react'
import { GatsbyImage } from 'gatsby-plugin-image'

const GalleryItem = ({ link, thumbnail, title, tech }) => {
  return (
    <>
      <article className="6u 12u$(xsmall) work-item">
        <a className="image fit thumb" href={link}>
          <GatsbyImage image={thumbnail} alt={title} />
        </a>
        <h3>{title}</h3>
        <p>{tech}</p>
      </article>
    </>
  )
}

export default GalleryItem
