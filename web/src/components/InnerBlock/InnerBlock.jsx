import React from 'react'
import { Link } from 'gatsby'
import Image from '../Image/Image'

export default function InnerBlock() {
  return (
    <section className="inner grow  text-white">
      <Link
        to="/"
        className="avatar border-grey shadow-inner-md relative m-auto mb-2  block h-[160px] w-[160px] translate-x-0 translate-y-0 overflow-hidden rounded-full border-[2px] border-white ring ring-slate-900"
      >
        <Image
          filename="kyle.jpg"
          alt="Kyle Ross profile picture"
          className="rounded-full"
        />
      </Link>
      <header className="mb-2 text-lg lg:text-2xl">
        <strong>Kyle Ross</strong>
      </header>
      <p className="mb-2 text-xl">Web Developer</p>
      <p className="mb-2 text-xl">Prescott, AZ</p>
    </section>
  )
}
