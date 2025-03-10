require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

console.log('Checking Sanity configuration:');
console.log('- Project ID:', projectId);
console.log('- Dataset:', dataset);
console.log('- Token exists:', !!process.env.SANITY_API_TOKEN);

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-03-09',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function verifySetup() {
  try {
    // First check if we can connect at all
    const datasets = await client.datasets.list();
    console.log('\nAvailable datasets:', datasets.map(d => d.name));

    // Then try to fetch any posts
    const posts = await client.fetch(`*[_type == "post"] {
      _id,
      title,
      publishedAt,
      slug
    }`);
    
    if (posts.length === 0) {
      console.log('\nNo posts found. Have you created and published any posts in your Sanity studio?');
    } else {
      console.log('\nFound', posts.length, 'posts:');
      posts.forEach(post => {
        console.log(`- ${post.title} (${post.publishedAt || 'no publish date'})`);
      });
    }
  } catch (error) {
    console.error('\nError:', error.message);
    if (error.response?.body) {
      console.error('Details:', error.response.body);
    }
  }
}

verifySetup();
