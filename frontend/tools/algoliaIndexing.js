import algoliasearch from 'algoliasearch';
import {createClient} from '@sanity/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.development' });

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.VITE_SANITY_DATASET,
  token: process.env.VITE_SANITY_TOKEN,
  useCdn: false,
  apiVersion: '2021-03-25',
});

const algoliaClient = algoliasearch(process.env.MY_ALGOLIA_APP_ID, process.env.MY_ALGOLIA_ADMIN_API_KEY);
//const index = algoliaClient.initIndex( process.env.MY_INDEX_NAME);

// Define content types with their queries and Algolia index names
const contentTypes = [
  {
    type: 'projects',
    indexName: 'projects',
    query: '*[_type == "projects" && defined(slug.current)] { _id, title, description, "slug": slug.current }'
  },
  {
    type: 'articles',
    indexName: 'posts',
    query: '*[_type == "articles" && defined(slug.current)] { _id, title, description, "slug": slug.current }'
  },
  {
    type: 'codepenExample',
    indexName: 'codepens',
    query: '*[_type == "codepenExample"] { _id, title, description }'
  }
];

const fetchSanityData = async (contentTypes) => {
  const results = {};
  for (const { type, query } of contentTypes) {
    results[type] = await client.fetch(query);
  }
  return results;
};

const formatDataForAlgolia = (data, contentType) => {
  return data.map(item => ({
    objectID: item._id,
    type: contentType,
    ...item
  }));
};

const indexToAlgolia = async () => {
  try {
    const allData = await fetchSanityData(contentTypes);

    for (const { type, indexName } of contentTypes) {
      const index = algoliaClient.initIndex(indexName);
      const algoliaObjects = formatDataForAlgolia(allData[type], type);
      
      const { objectIDs } = await index.saveObjects(algoliaObjects);
      console.log(`Indexed ${objectIDs.length} ${type} to Algolia index '${indexName}'`);
    }
  } catch (error) {
    console.error('Error during indexing:', error);
  }
};

indexToAlgolia();

export { indexToAlgolia };