import React from 'react'
import ContactFrom from './ContactFrom'
import { PortableText } from '@portabletext/react'

const Contact = (props) => {
  const showFrom = props.form === true
  return (
    <section className="border-b-2 py-16">
      <h2 className="mb-6 text-2xl uppercase">{props.heading}</h2>
      <PortableText value={props.contactForm_text} />
      {showFrom ? <ContactFrom /> : null}
    </section>
  )
}
export default Contact
