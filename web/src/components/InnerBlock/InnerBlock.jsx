import React from 'react'
import { Link, useStaticQuery, graphql } from 'gatsby'

import LogoSvg from '../LogoSvg/LogoSvg'

export default function InnerBlock() {
  const data = useStaticQuery(graphql`
    query Sidebar {
      settings: sanitySettings {
        name
        occupation
        location
      }
    }
  `)

  return (
    <section className="inner grow  text-white">
      <Link
        to="/"
        className="mb-6 flex justify-center"
        aria-label="Link to homepage"
      >
        <LogoSvg
          classes="w-[160px]"
          fillStroke={'#FFF'}
          fillBg={'#FFF'}
          fill={'#000'}
        />
      </Link>
      <header className="mb-2 text-lg lg:text-2xl">
        <strong>{data.settings.name}</strong>
      </header>
      <p className="mb-2 text-xl">{data.settings.occupation}</p>
      <p className="mb-2 text-xl">{data.settings.location}</p>
    </section>
  )
}
