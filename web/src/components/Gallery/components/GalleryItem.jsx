import React from 'react'
import { GatsbyImage } from 'gatsby-plugin-image'

const GalleryItem = ({ link, thumbnail, title, tech }) => {
  return (
    <article className="mb-6">
      <a className=" group/item project-link" href={link ? link : '#projects'}>
        <div className="group/edit project-link-overlay ">
          <div className="relative h-full w-full rounded-lg">
            <span className="project-link-overlay-link group-hover/item:visible group-hover/item:-translate-y-1/2 group-hover/item:opacity-100">
              {link ? 'View Site' : 'Currently Unavailable'}
            </span>
          </div>
        </div>
        <div className="group/edit w-full transition-all duration-700 ease-in-out ">
          <GatsbyImage image={thumbnail} alt={title} />
        </div>
      </a>
      <h3 className="mb-6 text-xl">{title}</h3>
      {tech && (
        <div className="flex flex-row flex-wrap">
          {tech.map((techUsed, i) => (
            <p
              key={i}
              className=" mx-[3px] mb-2 border-b-[1px] border-dashed border-gray-600 text-xs capitalize text-gray-600"
            >
              {techUsed}
            </p>
          ))}
        </div>
      )}
    </article>
  )
}

export default GalleryItem
