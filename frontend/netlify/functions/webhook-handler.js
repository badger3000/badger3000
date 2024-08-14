import {indexToAlgolia} from "./algoliaIndexing.js";

export const handler = async (event, context) => {
  // Log the entire event for debugging
  console.log("Received webhook event:", JSON.stringify(event, null, 2));

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
    console.log("Parsed webhook body:", JSON.stringify(body, null, 2));
  } catch (error) {
    console.error("Error parsing webhook payload:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({message: "Invalid JSON"}),
    };
  }

  // Log all properties of the body
  console.log("Webhook body properties:", Object.keys(body));

  // Try to identify the event type
  const eventType = body.type || body.operation || body.eventType;
  console.log("Identified event type:", eventType);

  const documentId = body.documentId || body._id || body.id;
  console.log("Identified document ID:", documentId);

  // Check if the webhook is triggered by a relevant event
  if (eventType && ["create", "update", "delete"].includes(eventType)) {
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
    console.log(`Received event with unrecognized type: ${eventType}`);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Event type not recognized or not relevant for indexing",
      }),
    };
  }
};
