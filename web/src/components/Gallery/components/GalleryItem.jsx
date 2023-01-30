import React from 'react'
import { GatsbyImage } from 'gatsby-plugin-image'

const GalleryItem = ({ link, thumbnail, title, tech }) => {
  return (
    <article className="mb-6">
      <a
        className=" mb-6 block overflow-hidden rounded-lg border"
        href={link}
        style={{ padding: '0' }}
      >
        <GatsbyImage image={thumbnail} alt={title} />
      </a>
      <h3 className="mb-6 text-xl">{title}</h3>
      <div className="flex flex-row">
        {tech
          ? tech.map((techUsed) => (
              <p className=" mx-[2px] rounded-md bg-gray-600 px-2 py-1 text-xs capitalize text-white">
                {techUsed}
              </p>
            ))
          : null}
      </div>
    </article>
  )
}

export default GalleryItem
