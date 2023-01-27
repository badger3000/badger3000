import React from 'react'
import ContactFrom from './ContactFrom'
import { PortableText } from '@portabletext/react'

const Contact = (props) => {
  if (props.form === true) {
    return (
      <section>
        <h2>{props.heading}</h2>
        <PortableText value={props.contactForm_text} />
        <ContactFrom />
      </section>
    )
  }
  return (
    <section>
      <h2>{props.heading}</h2>
      <PortableText value={props.contactForm_text} />
    </section>
  )
}

export default Contact
