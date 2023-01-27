/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it
exports.createSchemaCustomization = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'SanityPost',
      interfaces: ['Node'],
      fields: {
        isPublished: {
          type: 'Boolean!',
          resolve: (source) => new Date(source.publishedAt) <= new Date(),
        },
      },
    }),
  ])
}
