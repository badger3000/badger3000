import React from 'react'
import Gallery from '../Gallery'
const ProjectComponent = (props) => {
  const showProjects = props.display_projects === true
  return (
    <section id="projects" className="border-b-2 py-16">
      <h2 className="mb-6 text-2xl uppercase">{props.heading}</h2>
      {showProjects ? <Gallery /> : null}
    </section>
  )
}

export default ProjectComponent
