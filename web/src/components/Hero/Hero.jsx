import React from 'react'
import { PortableText } from '@portabletext/react'

export default function Hero(props) {
  const ctaPortableTextComponent = {
    marks: {
      cta: ({ children }) => {
        return <span className="button">{children}</span>
      },
    },
  }
  return (
    <section className="border-b-2 pb-11 text-base leading-7 text-zinc-600">
      <h1 className="mb-6 text-center text-xl uppercase text-black md:text-2xl lg:text-left lg:text-4xl">
        {props.heading}
      </h1>
      <PortableText
        value={props.hero_text}
        components={ctaPortableTextComponent}
      />
    </section>
  )
}
