import React from 'react'

const Footer = () => (
  <footer className="text-white">
    <div className="inner">
      <ul className="icons">
        <li>
          <a
            rel="preconnect"
            href="https://www.youtube.com/user/badger816"
            className="icon fa-youtube"
          >
            <span className="label">YouTube</span>
          </a>
        </li>
        <li>
          <a
            rel="preconnect"
            href="https://github.com/badger3000/badger3000"
            className="icon fa-github"
          >
            <span className="label">Github</span>
          </a>
        </li>
        <li>
          <a
            rel="preconnect"
            href="https://www.linkedin.com/in/badger816/"
            className="icon fa-linkedin"
          >
            <span className="label">Linkedin</span>
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
