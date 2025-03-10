require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-09',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function listContent() {
  try {
    // Get all documents and their types
    const documents = await client.fetch(`*[!(_type match "system.*")] {
      _type,
      _id,
      title,
      publishedAt,
      slug
    }`);

    // Group by type
    const byType = documents.reduce((acc, doc) => {
      acc[doc._type] = acc[doc._type] || [];
      acc[doc._type].push(doc);
      return acc;
    }, {});

    // Print summary
    console.log('Content in your Sanity dataset:');
    Object.entries(byType).forEach(([type, docs]) => {
      console.log(`\n${type} (${docs.length} documents):`);
      docs.forEach(doc => {
        console.log(`- ${doc.title || doc._id} ${doc.publishedAt ? `(${new Date(doc.publishedAt).toLocaleDateString()})` : ''}`);
      });
    });

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response?.body) {
      console.error('Details:', error.response.body);
    }
  }
}

listContent();
