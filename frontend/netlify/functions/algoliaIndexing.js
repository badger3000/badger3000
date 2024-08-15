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
    query: `*[_type == "projects" && _id == $documentId][0]{
      _id,
      title,
      "slug": slug.current,
      web_url,
      order,
      tech,
      "project_description": project_description[]{
        ...,
        _type == 'block' => {
          ...,
          children[]{
            ...,
            _type == 'span' => {
              ...,
              text
            }
          }
        }
      },
      "project_image": project_image{
        "url": asset->url,
        "metadata": asset->metadata,
        caption,
        attribution
      }
    }`,
  },
  // ... other content types remain the same
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

const formatForAlgolia = (document, contentType) => {
  const formattedDoc = {
    objectID: document._id,
    type: contentType,
    ...document,
  };

  // If it's a project, format the project_description
  if (contentType === "projects" && document.project_description) {
    formattedDoc.project_description = document.project_description
      .filter((block) => block._type === "block")
      .map((block) => block.children.map((child) => child.text).join(" "))
      .join(" ");
  }

  return formattedDoc;
};

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
