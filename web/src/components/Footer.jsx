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
    <div className="flex flex-col">
      <div className="flex flex-row justify-center">
        <a
          rel="preconnect"
          href="https://www.youtube.com/user/badger816"
          className="icon fa-youtube mx-1"
        >
          <FontAwesomeIcon
            className="stoke-1 hover:fill-black"
            icon="fa-brands fa-youtube"
          />
        </a>

        <a
          rel="preconnect"
          href="https://github.com/badger3000/badger3000"
          className="icon fa-github mx-1"
        >
          <FontAwesomeIcon icon="fa-brands fa-github" />
        </a>

        <a
          rel="preconnect"
          href="https://www.linkedin.com/in/badger816/"
          className="icon fa-linkedin mx-1"
        >
          <FontAwesomeIcon icon="fa-brands fa-linkedin" />
        </a>
      </div>
      <span className="block">&copy; Badger3000</span>
    </div>
  </footer>
)

export default Footer
