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
    <div className="inner">
      <ul className="icons inline-flex align-middle">
        <li>
          <a
            rel="preconnect"
            href="https://www.youtube.com/user/badger816"
            className="icon fa-youtube"
          >
            <FontAwesomeIcon className="stoke-1" icon="fa-brands fa-youtube" />
          </a>
        </li>
        <li>
          <a
            rel="preconnect"
            href="https://github.com/badger3000/badger3000"
            className="icon fa-github"
          >
            <FontAwesomeIcon icon="fa-brands fa-github" />
          </a>
        </li>
        <li>
          <a
            rel="preconnect"
            href="https://www.linkedin.com/in/badger816/"
            className="icon fa-linkedin"
          >
            <FontAwesomeIcon icon="fa-brands fa-linkedin" />
          </a>
        </li>
      </ul>
      <ul className="copyright">
        <li>&copy; Badger3000</li>
      </ul>
    </div>
  </footer>
)

export default Footer
