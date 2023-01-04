import React from 'react'
import Helmet from 'react-helmet'

import Gallery from '../components/Gallery'
import Layout from '../components/layout'
import PDF from '../assets/pdf/kyle-ross-resume.pdf'

const HomeIndex = () => {
  const siteTitle = 'Personal site of Kyle Ross'
  const siteDescription =
    'Kyle Ross is a front end developer, based in the Bay Area, California'

  return (
    <Layout>
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <html lang="en" />
      </Helmet>

      <div id="main">
        <section id="one">
          <header className="major">
            <h2>My main focus is on Front-End web technologies</h2>
          </header>
          <p>
            I have worked on large scale enterprise level web applications for
            companies such as
            <a rel="preconnect" href="https://www.sony.co.uk/" crossorigin>
              Sony
            </a>
            ,
            <a
              rel="preconnect"
              href="https://www.hotwire.com/hotels/"
              crossorigin
            >
              Hotwire.com
            </a>
            and
            <a rel="preconnect" href="https://samsungnext.com/" crossorigin>
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
          <h2>Contact Me</h2>
          <p>
            Currently
            <span
              style={{
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: 'green',
                paddingLeft: 5,
                paddingRight: 5,
              }}
            >
              available
            </span>
            for full or contract work, feel free to contact me.
          </p>
          <div className="row">
            <div className="12u 12u$(small)">
              <form
                method="POST"
                name="contact"
                action="/confirmation"
                netlify-honeypot="bot-field"
                data-netlify="true"
              >
                <input type="hidden" name="form-name" value="contact" />
                <p className="hidden" style={{ display: 'none' }}>
                  <label>
                    Don’t fill this out if you're human:
                    <input name="bot-field" />
                  </label>
                </p>
                <div className="row uniform 50%">
                  <div className="6u 12u$(xsmall)">
                    <label>
                      <span className="sr-text">name</span>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder="Name"
                        required
                      />
                    </label>
                  </div>
                  <div className="6u 12u$(xsmall)">
                    <label>
                      <span className="sr-text">email</span>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Email"
                        required
                      />
                    </label>
                  </div>
                  <div className="12u">
                    <label>
                      <span className="sr-text">message</span>
                      <textarea
                        name="message"
                        id="message"
                        placeholder="Message"
                        rows="4"
                        required
                      ></textarea>
                    </label>
                  </div>
                </div>
                <p className="actions" style={{ marginTop: 30 }}>
                  <button className="button" type="submit">
                    Send Message
                  </button>
                </p>
              </form>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default HomeIndex
