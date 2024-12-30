import {indexToAlgolia} from "./algoliaIndexing.js";

export const handler = async (event, context) => {
  console.log("Received webhook from Sanity");
  console.log("Event headers:", JSON.stringify(event.headers, null, 2));
  console.log("Event body:", event.body);

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    console.error("Error parsing webhook payload:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({message: "Invalid JSON", error: error.message}),
    };
  }

  const eventType = event.headers["sanity-operation"];
  const documentId = event.headers["sanity-document-id"];

  console.log(`Event type: ${eventType}, Document ID: ${documentId}`);

  if (["create", "update", "delete"].includes(eventType)) {
    try {
      console.log(`Processing ${eventType} event for document ${documentId}`);
      await indexToAlgolia(eventType, documentId);
      console.log(
        `Successfully processed ${eventType} event for document ${documentId}`
      );
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
          stack: error.stack,
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
