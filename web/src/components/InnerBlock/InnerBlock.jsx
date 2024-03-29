import React, { useState } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import LogoSvg from '../LogoSvg/LogoSvg'

export default function InnerBlock() {
  const [colors, setColors] = useState([
    { hex: 'FFF' },
    { hex: 'FFF' },
    { hex: '000' },
  ])

  const data = useStaticQuery(graphql`
    query Sidebar {
      settings: sanitySettings {
        name
        occupation
        location
      }
    }
  `)

  async function requestColors() {
    const options = {
      method: 'GET',
      cache: 'no-store',
    }
    const res = await fetch(
      `https://www.colr.org/json/colors/random/3`,
      options
    )
    const json = await res.json()

    setColors(json.colors)
    //console.log(colors)
  }

  return (
    <section className="inner grow  text-white">
      <a
        href="/"
        className="mb-6 flex justify-center"
        aria-label="Click to change logo color"
        onClick={(e) => {
          e.preventDefault()
          requestColors()
        }}
      >
        <LogoSvg
          classes="w-[160px]"
          fillStroke={`#${colors[0].hex}`}
          fillBg={`#${colors[1].hex}`}
          fill={`#${colors[2].hex}`}
        />
      </a>
      <header className="mb-2 text-lg lg:text-2xl">
        <strong>{data.settings.name}</strong>
      </header>
      <p className="mb-2 text-xl">{data.settings.occupation}</p>
      <p className="mb-2 text-xl">{data.settings.location}</p>
    </section>
  )
}
