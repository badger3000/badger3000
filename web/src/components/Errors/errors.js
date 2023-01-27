import React from "react";
import GraphQLErrorList from "./graphql-error-list";
import Layout from "../Layout/Layout";

const Errors = ({ errors }) => (
  <Layout>
    <GraphQLErrorList errors={errors} />
  </Layout>
);

export default Errors;
