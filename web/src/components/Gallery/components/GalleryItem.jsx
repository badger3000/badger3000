import React from 'react'
import { GatsbyImage } from 'gatsby-plugin-image'

const GalleryItem = ({ link, thumbnail, title, tech }) => {
  return (
    <article className="mb-6">
      <a
        className=" group/item relative mb-6 block origin-center transform-gpu overflow-hidden rounded-lg  border transition-all hover:scale-[105%] hover:drop-shadow-xl "
        href={link ? link : '#projects'}
      >
        <div className="group/edit absolute top-0 left-0 z-20 h-full w-full bg-white/0 transition-all duration-500 ease-in-out hover:bg-white/50">
          <div className="relative h-full w-full">
            <span className=" invisible absolute top-1/2 left-1/2 z-10 inline-block h-auto  -translate-x-1/2 -translate-y-0 transform rounded-xl border-[2px] bg-gray-600 p-4 text-center uppercase text-white opacity-0 transition-all duration-500 ease-in-out group-hover/item:visible group-hover/item:-translate-y-1/2 group-hover/item:opacity-100 ">
              {link ? 'View Site' : 'Currently Unavailable'}
            </span>
          </div>
        </div>
        <div className="group/edit transition-all duration-700 ease-in-out ">
          <GatsbyImage image={thumbnail} alt={title} />
        </div>
      </a>
      <h3 className="mb-6 text-xl">{title}</h3>
      {tech && (
        <div className="flex flex-row flex-wrap">
          {tech.map((techUsed) => (
            <p className=" mx-[3px] mb-2 border-b-[1px] border-dashed border-gray-600 text-xs capitalize text-gray-600">
              {techUsed}
            </p>
          ))}
        </div>
      )}
    </article>
  )
}

export default GalleryItem
