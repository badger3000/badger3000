import React from 'react'
import { Link } from 'gatsby'
import Image from './Image'

export default function InnerBlock() {
  return (
    <section className="inner grow  text-white">
      <Link
        to="/"
        className="image avatar border-grey shadow-inner-md relative m-auto mb-6 block h-[160px] w-[160px] overflow-hidden rounded-full border-[2px] border-white"
      >
        <Image filename="kyle.jpg" alt="Kyle Ross profile picture" />
      </Link>
      <header>
        <strong className="text-2xl">Kyle Ross</strong>
      </header>
      <p className="text-xl">Web Developer</p>
      <p className="text-xl">Prescott, AZ</p>
    </section>
  )
}
