require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-09',
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
  perspective: 'published'
});

async function testSanityConnection() {
  try {
    console.log('Using configuration:', {
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      tokenExists: !!process.env.SANITY_API_TOKEN
    });

    const posts = await client.fetch(`*[_type == "post"][0...3]`);
    console.log('\nFetched posts:', JSON.stringify(posts, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response details:', error.response.body);
    }
  }
}

testSanityConnection();
