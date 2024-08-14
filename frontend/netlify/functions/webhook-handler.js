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
    console.log("Parsed webhook body:", JSON.stringify(body, null, 2));
  } catch (error) {
    console.error("Error parsing webhook payload:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({message: "Invalid JSON"}),
    };
  }

  console.log("Webhook body properties:", Object.keys(body));

  // Infer the event type
  let eventType;
  if (!body._id) {
    eventType = "delete";
  } else if (body._createdAt === body._updatedAt) {
    eventType = "create";
  } else {
    eventType = "update";
  }

  console.log("Inferred event type:", eventType);

  const documentId = body._id;
  console.log("Document ID:", documentId);

  if (eventType && documentId) {
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
    console.log(`Received event with unrecognized type or missing document ID`);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Event not recognized or missing document ID",
      }),
    };
  }
};
