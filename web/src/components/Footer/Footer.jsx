import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faYoutube,
  faGithub,
  faLinkedin,
  faCodepen,
} from '@fortawesome/free-brands-svg-icons'
library.add(faYoutube, faGithub, faLinkedin, faCodepen)
const Footer = () => {
  const data = useStaticQuery(graphql`
    query SocialLinks {
      social: sanitySettings {
        links {
          id
          webUrl
          siteName
        }
      }
    }
  `)

  const links = data.social.links
  return (
    <footer className="text-white">
      <div className="flex flex-row justify-center lg:pb-4">
        {links.map((link) => (
          <a
            key={link.id}
            rel="preconnect"
            href={link.webUrl}
            className={`icon fa-${link.siteName} mx-2`}
            aria-label={`Find me on ${link.siteName}`}
          >
            <FontAwesomeIcon
              className="stoke-1 hover:fill-black"
              icon={`fa-brands fa-${link.siteName}`}
              size="2x"
            />
          </a>
        ))}
      </div>
    </footer>
  )
}

export default Footer
