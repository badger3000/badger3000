import React from 'react'
import { GatsbyImage } from 'gatsby-plugin-image'

const GalleryItem = ({ link, thumbnail, title, tech }) => {
  return (
    <>
      <article className="mb-6">
        <a
          className=" mb-6 block overflow-hidden rounded-lg border"
          href={link}
          style={{ padding: '0' }}
        >
          <GatsbyImage image={thumbnail} alt={title} />
        </a>
        <h3 className="mb-6 text-xl">{title}</h3>
        <p>{tech}</p>
      </article>
    </>
  )
}

export default GalleryItem
