import algoliasearch from "algoliasearch";
import {createClient} from "@sanity/client";

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  token: process.env.SANITY_TOKEN,
  useCdn: false,
  apiVersion: "2021-03-25",
});

const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_API_KEY
);

// Define content types with their queries and Algolia index names
const contentTypes = [
  {
    type: "projects",
    indexName: "projects",
    query:
      '*[_type == "projects" && defined(slug.current)] { _id, title, description, "slug": slug.current }',
  },
  {
    type: "articles",
    indexName: "posts",
    query:
      '*[_type == "articles" && defined(slug.current)] { _id, title, description, "slug": slug.current }',
  },
  {
    type: "codepenExample",
    indexName: "codepens",
    query: '*[_type == "codepenExample"] { _id, title, description }',
  },
];

const fetchSanityData = async (contentTypes) => {
  const results = {};
  for (const {type, query} of contentTypes) {
    results[type] = await client.fetch(query);
  }
  return results;
};

const formatDataForAlgolia = (data, contentType) => {
  return data.map((item) => ({
    objectID: item._id,
    type: contentType,
    ...item,
  }));
};

export const indexToAlgolia = async (eventType, documentId) => {
  try {
    if (eventType === "delete") {
      // Handle deletion
      for (const {indexName} of contentTypes) {
        const index = algoliaClient.initIndex(indexName);
        await index.deleteObject(documentId);
        console.log(
          `Deleted document ${documentId} from Algolia index '${indexName}'`
        );
      }
    } else {
      // Handle creation or update
      const allData = await fetchSanityData(contentTypes);

      for (const {type, indexName} of contentTypes) {
        const index = algoliaClient.initIndex(indexName);
        const algoliaObjects = formatDataForAlgolia(allData[type], type);

        const {objectIDs} = await index.saveObjects(algoliaObjects);
        console.log(
          `Indexed ${objectIDs.length} ${type} to Algolia index '${indexName}'`
        );
      }
    }
  } catch (error) {
    console.error("Error during indexing:", error);
    throw error; // Rethrow the error so the webhook handler can catch it
  }
};
