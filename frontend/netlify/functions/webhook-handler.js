import { indexToAlgolia } from '../../algoliaIndexing.js';

export const handler = async (event, context) => {
  // Verify the webhook secret
  const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;
  if (event.headers['sanity-webhook-secret'] !== WEBHOOK_SECRET) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
    };
  }

  // Parse the webhook payload
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid JSON' }),
    };
  }

  const { type } = body;

  // Check if the webhook is triggered by a relevant event
  if (['create', 'update', 'delete'].includes(type)) {
    try {
      console.log(`Received ${type} event from Sanity. Starting indexing...`);
      await indexToAlgolia();
      console.log('Indexing completed successfully');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Indexing completed' }),
      };
    } catch (error) {
      console.error('Error during indexing:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Indexing failed', error: error.message }),
      };
    }
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Event type not relevant for indexing' }),
    };
  }
};