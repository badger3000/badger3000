import React from 'react'
import Gallery from '../Gallery'
const ProjectComponent = (props) => {
  if (props.display_projects === true) {
    return (
      <section className="border-b-2 py-16">
        <h2 className="mb-6 text-2xl uppercase">{props.heading}</h2>
        <Gallery />
      </section>
    )
  }
  return (
    <section className="border-b-2 py-16">
      <h2 className="mb-6 text-2xl uppercase">{props.heading}</h2>
    </section>
  )
}

export default ProjectComponent
