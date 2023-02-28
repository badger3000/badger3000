import React from 'react'
import { GatsbyImage } from 'gatsby-plugin-image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faJava,
  faHtml5,
  faCss3,
  faSass,
  faJs,
  faReact,
  faNodeJs,
  faHubspot,
  faDocker,
  faAws,
  faShopify,
  faWordpress,
  faPhp,
} from '@fortawesome/free-brands-svg-icons'
library.add(
  faJava,
  faHtml5,
  faCss3,
  faSass,
  faJs,
  faReact,
  faNodeJs,
  faHubspot,
  faDocker,
  faAws,
  faShopify,
  faPhp,
  faWordpress
)

const GalleryItem = ({ link, thumbnail, title, tech }) => {
  const itemsNoIcon = [
    'jQuery',
    'Webflow',
    'Liquid',
    'tailwindcss',
    'netlify',
    'gatsbyJs',
    'jamstack',
    'GCloud',
    '...more',
  ]

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
          {tech
            .filter((item) => !itemsNoIcon.includes(item))
            .map((techUsed, i) => (
              <p
                key={i}
                className=" mx-[3px] mb-2 text-xs capitalize text-gray-600"
              >
                <FontAwesomeIcon
                  key={i}
                  className="stoke-1 mx-[5px] hover:fill-black"
                  icon={`fa-brands fa-${techUsed}`}
                  size="lg"
                />
                {techUsed}
              </p>
            ))}
        </div>
      )}
    </article>
  )
}

export default GalleryItem
