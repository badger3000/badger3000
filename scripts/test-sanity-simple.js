require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'y57e12m54',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-03-09',
  token: process.env.SANITY_API_TOKEN
});

async function testSanityConnection() {
  try {
    // First, let's just try to fetch any document to test the connection
    const test = await client.fetch('*[_type == "post"][0]');
    console.log('Connection successful!');
    console.log('Test document:', test);
  } catch (error) {
    console.error('Error details:', {
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      error: error.message
    });
  }
}

testSanityConnection();
