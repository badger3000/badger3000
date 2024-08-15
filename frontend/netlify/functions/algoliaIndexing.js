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
  process.env.PUBLIC_MY_ALGOLIA_APP_ID,
  process.env.PUBLIC_MY_ALGOLIA_ADMIN_API_KEY
);

const contentTypes = [
  {
    type: "projects",
    indexName: process.env.PUBLIC_MY_INDEX_NAME_PROJECTS,
    query:
      '*[_type == "projects" && _id == $documentId][0]{ _id, title, description, "slug": slug.current }',
  },
  {
    type: "articles",
    indexName: process.env.PUBLIC_MY_INDEX_NAME_POSTS,
    query:
      '*[_type == "articles" && _id == $documentId][0]{ _id, title, description, "slug": slug.current }',
  },
  {
    type: "codepenExample",
    indexName: process.env.PUBLIC_MY_INDEX_NAME_CODEPENS,
    query:
      '*[_type == "codepenExample" && _id == $documentId][0]{ _id, title, description }',
  },
];

const fetchSanityDocument = async (documentId) => {
  for (const {type, query} of contentTypes) {
    try {
      const document = await client.fetch(query, {documentId});
      if (document) {
        console.log(`Found document of type ${type}:`, document);
        return {type, document};
      }
    } catch (error) {
      console.error(`Error fetching ${type} document:`, error);
    }
  }
  console.log(`Document ${documentId} not found in any content type`);
  return null;
};

const formatForAlgolia = (document, contentType) => ({
  objectID: document._id,
  type: contentType,
  ...document,
});

export const indexToAlgolia = async (eventType, documentId) => {
  console.log(
    `Indexing to Algolia: ${eventType} event for document ${documentId}`
  );

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
        const contentType = contentTypes.find((ct) => ct.type === type);
        if (!contentType) {
          throw new Error(`No matching content type found for ${type}`);
        }
        const index = algoliaClient.initIndex(contentType.indexName);
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
