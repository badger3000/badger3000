import React from 'react'
import { PortableText } from '@portabletext/react'

export default function Hero(props) {
  const ctaPortableTextComponent = {
    marks: {
      cta: ({ children }) => {
        return (
          <span className="mt-6 inline-block rounded-lg border-[3px] border-solid border-[#efefef] px-6 py-4 uppercase transition-all duration-700	ease-in-out hover:border-[#075841] hover:text-[#075841]	">
            {children}
          </span>
        )
      },
    },
  }
  return (
    <section className="border-b-2 py-11 text-base leading-7 text-zinc-600">
      <h1 className="mb-11 text-4xl uppercase text-black">{props.heading}</h1>
      <PortableText
        value={props.hero_text}
        components={ctaPortableTextComponent}
      />
    </section>
  )
}
