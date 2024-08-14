import {indexToAlgolia} from "./algoliaIndexing.js";

export const handler = async (event, context) => {
  // Verify the webhook secret
  const WEBHOOK_SECRET = process.env.VITE_SANITY_WEBHOOK_SECRET;
  if (event.headers["sanity-webhook-secret"] !== WEBHOOK_SECRET) {
    console.error("Unauthorized webhook attempt");
    return {
      statusCode: 401,
      body: JSON.stringify({message: "Unauthorized"}),
    };
  }

  // Parse the webhook payload
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    console.error("Error parsing webhook payload:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({message: "Invalid JSON"}),
    };
  }

  const {type: eventType, documentId} = body;

  // Check if the webhook is triggered by a relevant event
  if (["create", "update", "delete"].includes(eventType)) {
    try {
      console.log(
        `Received ${eventType} event from Sanity for document ${documentId}. Starting indexing...`
      );

      await indexToAlgolia(eventType, documentId);

      console.log(`Indexing completed successfully for document ${documentId}`);
      return {
        statusCode: 200,
        body: JSON.stringify({message: "Indexing completed", documentId}),
      };
    } catch (error) {
      console.error(`Error during indexing for document ${documentId}:`, error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Indexing failed",
          error: error.message,
          documentId,
        }),
      };
    }
  } else {
    console.log(`Received non-indexing event: ${eventType}`);
    return {
      statusCode: 200,
      body: JSON.stringify({message: "Event type not relevant for indexing"}),
    };
  }
};
