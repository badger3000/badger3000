import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import GalleryItem from './GalleryItem'

const Gallery = () => {
  const data = useStaticQuery(graphql`
    query Sanity {
      projects: allSanityProjects {
        edges {
          node {
            title
            tech
            web_url
            project_image {
              asset {
                gatsbyImage(width: 600)
              }
            }
            id
          }
        }
      }
    }
  `)
  const projectItems = data.projects.edges

  return (
    <>
      {projectItems && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-2">
          {projectItems.map((project) => {
            return (
              <GalleryItem
                key={project.node.id}
                thumbnail={project.node.project_image.asset.gatsbyImage}
                link={project.node.web_url}
                title={project.node.title}
                tech={project.node.tech}
              />
            )
          })}
        </div>
      )}
    </>
  )
}

export default Gallery
