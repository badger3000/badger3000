import React from 'react'
import { GatsbyImage } from 'gatsby-plugin-image'

const GalleryItem = ({ link, thumbnail, title, tech }) => {
  return (
    <article className="mb-6">
      <a
        className=" group/item relative mb-6 block origin-center transform-gpu overflow-hidden rounded-lg  border transition-all hover:skew-x-1 hover:scale-[102%] hover:drop-shadow-xl"
        href={link ? link : '#projects'}
      >
        <span className="group/edit invisible absolute top-1/2 left-1/2 z-10 inline-block h-auto  -translate-x-1/2 -translate-y-0 transform rounded-xl border-[2px] bg-gray-600 p-4 text-center uppercase text-white opacity-0 transition-all duration-500 ease-in-out group-hover/item:visible group-hover/item:-translate-y-1/2 group-hover/item:opacity-100 ">
          {link ? 'View Site' : 'This site is no longer live'}
        </span>
        <div className="group/edit transition-all duration-500 ease-in-out group-hover/item:opacity-40">
          <GatsbyImage image={thumbnail} alt={title} />
        </div>
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
