require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-09',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function testArticles() {
  try {
    console.log('Testing articles query...');
    const articles = await client.fetch(`*[_type == "articles" || _type == "latest"] {
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      excerpt
    }`);
    
    console.log('\nFound articles:', JSON.stringify(articles, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response?.body) {
      console.error('Details:', error.response.body);
    }
  }
}

testArticles();
