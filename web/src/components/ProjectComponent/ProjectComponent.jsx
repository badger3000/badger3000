import React from 'react'
import Gallery from '../Gallery'
const ProjectComponent = (props) => {
  if (props.display_projects === true) {
    return (
      <section>
        <h2>{props.heading}</h2>
        <Gallery />
      </section>
    )
  }
  return (
    <section>
      <h2>{props.heading}</h2>
    </section>
  )
}

export default ProjectComponent
