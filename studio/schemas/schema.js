// import the schema creator
import createSchema from 'part:@sanity/base/schema-creator'
// import schema types from any plugins that might expose them
import schemaTypes from 'all:part:@sanity/base/schema-type'
//import are types
import latest from './parts/latest'
import projects from './parts/projects'

export default createSchema({
  name: 'badger3000',
  types: schemaTypes.concat([latest, projects]),
})
