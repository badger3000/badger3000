import React from 'react'
import { GatsbyImage } from 'gatsby-plugin-image'

const GalleryItem = ({ link, thumbnail, title, tech }) => {
  return (
    <article className="mb-6">
      <a
        className=" relative mb-6 block origin-center transform-gpu overflow-hidden rounded-lg  border transition-all hover:skew-x-1 hover:scale-[102%] hover:drop-shadow-xl"
        href={link ? link : '#projects'}
      >
        <div className="invisible absolute z-10 h-full w-full hover:visible">
          <span className="rounded-xl border-[2px] p-4 uppercase ">
            {link ? 'View Site' : 'This site is no longer live'}
          </span>
        </div>
        <GatsbyImage image={thumbnail} alt={title} />
      </a>
      <h3 className="mb-6 text-xl">{title}</h3>
      {tech && (
        <div className="flex flex-row">
          {tech.map((techUsed) => (
            <p className=" mx-[2px] rounded-md bg-gray-600 px-2 py-1 text-xs capitalize text-white">
              {techUsed}
            </p>
          ))}
        </div>
      )}
    </article>
  )
}

export default GalleryItem
