require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-09',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function testSanityConnection() {
  try {
    console.log('Testing connection with token:', process.env.SANITY_API_TOKEN?.slice(0, 10) + '...');
    
    // Try a simple query first
    const result = await client.fetch(`*[_type == "post"][0...1]`);
    console.log('\nConnection successful!');
    console.log('Results:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Connection failed:', error.message);
    if (error.response?.body) {
      console.error('Response:', error.response.body);
    }
  }
}

testSanityConnection();
