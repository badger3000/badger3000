import React from 'react'
import { Link } from 'gatsby'
import Image from './Image'

export default function InnerBlock() {
  return (
    <div className="inner">
      <Link
        to="/"
        className="image avatar"
        style={{
          display: 'inline-block',
          width: '100px',
          height: '100px',
        }}
      >
        <Image filename="avatar.jpg" alt="Kyle Ross profile picture" />
      </Link>
      <h1>
        <strong>Kyle Ross</strong>
      </h1>
      <p style={{ marginBottom: 0, fontSize: '1.5em' }}>Web Developer</p>
      <p style={{ marginBottom: 0, fontSize: '1.5em' }}>Prescott, AZ</p>
    </div>
  )
}
