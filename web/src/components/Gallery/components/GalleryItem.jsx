import React from 'react'
import { GatsbyImage } from 'gatsby-plugin-image'

const GalleryItem = ({ link, thumbnail, title, tech }) => {
  return (
    <>
      <article>
        <a className="image fit thumb" href={link} style={{ padding: '0' }}>
          <GatsbyImage image={thumbnail} alt={title} />
        </a>
        <h3>{title}</h3>
        <p>{tech}</p>
      </article>
    </>
  )
}

export default GalleryItem
