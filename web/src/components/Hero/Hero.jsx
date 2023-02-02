import React from 'react'
import { PortableText } from '@portabletext/react'
//import LogoSvg from '../LogoSvg/LogoSvg'

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
      <div className="flex flex-col justify-center align-middle">
        <h1 className=" mb-6 text-center text-xl uppercase text-black md:text-2xl lg:text-left lg:text-4xl">
          {props.heading}
        </h1>
      </div>
      <PortableText
        value={props.hero_text}
        components={ctaPortableTextComponent}
      />
    </section>
  )
}
