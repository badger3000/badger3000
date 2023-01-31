import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faYoutube,
  faGithub,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons'
library.add(faYoutube, faGithub, faLinkedin)
const Footer = () => (
  <footer className="text-white">
    <div className="flex flex-row justify-center lg:pb-4">
      <a
        rel="preconnect"
        href="https://www.youtube.com/user/badger816"
        className="icon fa-youtube mx-2"
        aria-label="Find me on Youtube"
      >
        <FontAwesomeIcon
          className="stoke-1 hover:fill-black"
          icon="fa-brands fa-youtube"
          size="2x"
        />
      </a>

      <a
        rel="preconnect"
        href="https://github.com/badger3000/badger3000"
        className="icon fa-github mx-2"
        aria-label="You can view this source code on github.com/badger3000/badger3000"
      >
        <FontAwesomeIcon icon="fa-brands fa-github" size="2x" />
      </a>

      <a
        rel="preconnect"
        href="https://www.linkedin.com/in/badger816/"
        className="icon fa-linkedin mx-2"
        aria-label="Fine me on Linkedin"
      >
        <FontAwesomeIcon icon="fa-brands fa-linkedin" size="2x" />
      </a>
    </div>
  </footer>
)

export default Footer
