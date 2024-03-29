/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require(`path`)

async function createPreviewPages(reporter, graphql, actions) {
  const { createPage } = actions
  const pageTemplate = path.resolve(`src/templates/page-previews.jsx`)
  const result = await graphql(`
    query {
      allSanityPage {
        edges {
          node {
            _id
            id
            slug {
              _key
              _type
              current
              source
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your Sanity pages`,
      result.errors
    )
    return
  }
  result.data.allSanityPage.edges.forEach((edge) => {
    const { id, slug = {} } = edge.node
    const path = `/${slug.current}`
    reporter.info(`Creating Preview Page: ${slug.current}`)
    createPage({
      path: path,
      component: pageTemplate,
      context: { id },
    })
  })
}
exports.createPages = async ({ reporter, graphql, actions }) => {
  await createPreviewPages(reporter, graphql, actions)
}
