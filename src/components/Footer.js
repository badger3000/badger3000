import React from 'react'

const Footer = () => (
  <div id="footer">
    <div className="inner">
      <ul className="icons">
        <li>
          <a
            rel="preconnect"
            href="https://www.youtube.com/user/badger816"
            className="icon fa-youtube"
            crossorigin
          >
            <span className="label">YouTube</span>
          </a>
        </li>
        <li>
          <a
            rel="preconnect"
            href="https://github.com/badger612/badger3000.git"
            className="icon fa-github"
            crossorigin
          >
            <span className="label">Github</span>
          </a>
        </li>
        <li>
          <a
            rel="preconnect"
            href="https://www.linkedin.com/in/badger816/"
            className="icon fa-linkedin"
            crossorigin
          >
            <span className="label">Linkedin</span>
          </a>
        </li>
      </ul>
      <ul className="copyright">
        <li>&copy; Badger3000</li>
      </ul>
    </div>
  </div>
)

export default Footer
