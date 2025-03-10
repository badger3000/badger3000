require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-09',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkContent() {
  try {
    // First, let's see what types of documents exist
    const types = await client.fetch(`
      *[defined(_type)] {
        _type
      } | group by _type
    `);
    
    console.log('Document types in your dataset:');
    types.forEach(type => {
      console.log(`- ${type._type}: ${type.count} documents`);
    });

    // Now let's look at a sample of each type
    for (const type of types) {
      console.log(`\nSample of ${type._type}:`);
      const samples = await client.fetch(`*[_type == "${type._type}"][0...1]`);
      console.log(JSON.stringify(samples, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response?.body) {
      console.error('Details:', error.response.body);
    }
  }
}

checkContent();
