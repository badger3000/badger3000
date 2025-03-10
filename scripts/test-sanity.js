require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-09',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function testSanityConnection() {
  try {
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt) && !(_id in path("drafts.**"))] | order(publishedAt desc) [0...10] {
        _id,
        title,
        slug,
        publishedAt,
        excerpt
      }
    `);
    console.log('Found posts:', JSON.stringify(posts, null, 2));
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}

testSanityConnection();
