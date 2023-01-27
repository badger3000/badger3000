import React from 'react'
import { Link } from 'gatsby'
import Image from './Image'

export default function InnerBlock() {
  return (
    <div className="inner text-right text-white">
      <Link
        to="/"
        className="image avatar border-grey shadow-inner-md relative m-auto block w-[100px] overflow-hidden rounded-full"
      >
        <Image filename="avatar.jpg" alt="Kyle Ross profile picture" />
      </Link>
      <h1>
        <strong>Kyle Ross</strong>
      </h1>
      <p>Web Developer</p>
      <p>Prescott, AZ</p>
    </div>
  )
}
