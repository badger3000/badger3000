import React from 'react'
import { Link } from 'gatsby'

import LogoSvg from '../LogoSvg/LogoSvg'
export default function InnerBlock() {
  return (
    <section className="inner grow  text-white">
      <Link to="/" className="mb-6 flex justify-center">
        <LogoSvg classes="w-[160px]" />
      </Link>
      <header className="mb-2 text-lg lg:text-2xl">
        <strong>Kyle Ross</strong>
      </header>
      <p className="mb-2 text-xl">Web Developer</p>
      <p className="mb-2 text-xl">Prescott, AZ</p>
    </section>
  )
}
