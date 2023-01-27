import React from 'react'
import { PortableText } from '@portabletext/react'

export default function Hero(props) {
  return (
    <section>
      <header className="">{props.heading}</header>
      <PortableText value={props.hero_text} />
    </section>
  )
}
