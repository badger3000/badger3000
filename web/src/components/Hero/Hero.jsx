import React from 'react'
import { PortableText } from '@portabletext/react'

export default function Hero(props) {
  return (
    <section className="border-b-2 py-11 text-base leading-6 text-zinc-600">
      <h1 className="mb-11 text-4xl uppercase text-black">{props.heading}</h1>
      <PortableText className="text-base" value={props.hero_text} />
    </section>
  )
}
