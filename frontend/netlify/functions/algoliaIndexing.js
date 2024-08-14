import algoliasearch from "algoliasearch";
import {createClient} from "@sanity/client";

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.VITE_SANITY_DATASET,
  token: process.env.VITE_SANITY_TOKEN,
  useCdn: false,
  apiVersion: "2021-03-25",
});

const algoliaClient = algoliasearch(
  process.env.MY_ALGOLIA_APP_ID,
  process.env.MY_ALGOLIA_ADMIN_API_KEY
);

const contentTypes = [
  {
    type: "projects",
    indexName: process.env.MY_INDEX_NAME_PROJECTS,
    query:
      '*[_type == "projects" && _id == $documentId][0]{ _id, title, description, "slug": slug.current }',
  },
  {
    type: "articles",
    indexName: process.env.MY_INDEX_NAME_POSTS,
    query:
      '*[_type == "articles" && _id == $documentId][0]{ _id, title, description, "slug": slug.current }',
  },
  {
    type: "codepenExample",
    indexName: process.env.MY_INDEX_NAME_CODEPENS,
    query:
      '*[_type == "codepenExample" && _id == $documentId][0]{ _id, title, description }',
  },
];

const fetchSanityDocument = async (documentId) => {
  for (const {type, query} of contentTypes) {
    const document = await client.fetch(query, {documentId});
    if (document) {
      return {type, document};
    }
  }
  return null;
};

const formatForAlgolia = (document, contentType) => ({
  objectID: document._id,
  type: contentType,
  ...document,
});

export const indexToAlgolia = async (eventType, documentId) => {
  try {
    if (eventType === "delete") {
      for (const {indexName} of contentTypes) {
        const index = algoliaClient.initIndex(indexName);
        await index.deleteObject(documentId);
        console.log(
          `Deleted document ${documentId} from Algolia index '${indexName}'`
        );
      }
    } else {
      const result = await fetchSanityDocument(documentId);
      if (result) {
        const {type, document} = result;
        const index = algoliaClient.initIndex(
          contentTypes.find((ct) => ct.type === type).indexName
        );
        const algoliaObject = formatForAlgolia(document, type);
        await index.saveObject(algoliaObject);
        console.log(
          `Indexed document ${documentId} to Algolia index for ${type}`
        );
      } else {
        console.log(`Document ${documentId} not found in Sanity`);
      }
    }
  } catch (error) {
    console.error("Error during indexing:", error);
    throw error;
  }
};
