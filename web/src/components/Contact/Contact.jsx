import React from 'react'
import ContactFrom from './ContactFrom'
import { PortableText } from '@portabletext/react'

const Contact = (props) => {
  if (props.form === true) {
    return (
      <section className="py-16">
        <h2 className="mb-6 text-2xl uppercase">{props.heading}</h2>
        <PortableText value={props.contactForm_text} />
        <ContactFrom />
      </section>
    )
  }
  return (
    <section className="py-16">
      <h2 className="mb-6 text-2xl uppercase">{props.heading}</h2>
      <PortableText value={props.contactForm_text} />
    </section>
  )
}

export default Contact
