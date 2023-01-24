import React from 'react'

import Gallery from '../components/Gallery'
import Layout from '../components/layout'
import ContactFrom from '../components/ContactFrom'
import PDF from '../assets/pdf/kyle-ross-resume.pdf'
import { useSiteMetadata } from '../components/hooks/site-meta'

const HomeIndex = () => {
  return (
    <Layout>
      <div id="main">
        <section id="one">
          <header className="major">
            <h2>My main focus is on Front-End web technologies</h2>
          </header>
          <p>
            I have worked on large scale enterprise level web applications for
            companies such as{' '}
            <a rel="preconnect" href="https://www.headspace.com/">
              Headspace
            </a>
            ,
            <a rel="preconnect" href="https://www.sony.co.uk/">
              Sony
            </a>
            ,
            <a rel="preconnect" href="https://www.hotwire.com/hotels/">
              Hotwire.com
            </a>
            and
            <a rel="preconnect" href="https://samsungnext.com/">
              Samsung
            </a>
            . I have also worked on a variety of digital projects for small
            businesses, artists and professional athletes.
          </p>
          <ul className="actions">
            <li>
              <a href={PDF} className="button">
                Download Resume
              </a>
            </li>
          </ul>
        </section>

        <section id="two">
          <h2>Projects</h2>
          <Gallery />
        </section>

        <section id="three">
          <ContactFrom />
        </section>
      </div>
    </Layout>
  )
}

export default HomeIndex

export function Head() {
  const { title, description } = useSiteMetadata()
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
    </>
  )
}
