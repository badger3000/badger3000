import React from 'react'
import GraphQLErrorList from './GraphqlErrorList'
import Layout from '../Layout'

const Errors = ({ errors }) => (
  <Layout>
    <GraphQLErrorList errors={errors} />
  </Layout>
)

export default Errors
