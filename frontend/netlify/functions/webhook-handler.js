import {indexToAlgolia} from "./algoliaIndexing.js";

export const handler = async (event, context) => {
  console.log(
    "Received event headers:",
    JSON.stringify(event.headers, null, 2)
  );

  const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;
  console.log("SANITY_WEBHOOK_SECRET from env:", WEBHOOK_SECRET);
  console.log("Received secret:", event.headers["sanity-webhook-secret"]);

  if (!WEBHOOK_SECRET) {
    console.error("SANITY_WEBHOOK_SECRET is not set in environment variables");
    return {
      statusCode: 500,
      body: JSON.stringify({message: "Server configuration error"}),
    };
  }

  // Log the types and lengths of the secrets
  console.log("Type of WEBHOOK_SECRET:", typeof WEBHOOK_SECRET);
  console.log("Length of WEBHOOK_SECRET:", WEBHOOK_SECRET.length);
  console.log(
    "Type of received secret:",
    typeof event.headers["sanity-webhook-secret"]
  );
  console.log(
    "Length of received secret:",
    event.headers["sanity-webhook-secret"]
      ? event.headers["sanity-webhook-secret"].length
      : "N/A"
  );

  // Perform a character-by-character comparison
  let mismatchIndex = -1;
  for (
    let i = 0;
    i <
    Math.max(
      WEBHOOK_SECRET.length,
      event.headers["sanity-webhook-secret"].length
    );
    i++
  ) {
    if (WEBHOOK_SECRET[i] !== event.headers["sanity-webhook-secret"][i]) {
      mismatchIndex = i;
      break;
    }
  }

  if (mismatchIndex !== -1) {
    console.error(`Mismatch at index ${mismatchIndex}`);
    console.error(`WEBHOOK_SECRET char: ${WEBHOOK_SECRET[mismatchIndex]}`);
    console.error(
      `Received secret char: ${event.headers["sanity-webhook-secret"][mismatchIndex]}`
    );
  }

  if (event.headers["sanity-webhook-secret"] !== WEBHOOK_SECRET) {
    console.error("Unauthorized webhook attempt. Secrets do not match.");
    return {
      statusCode: 401,
      body: JSON.stringify({message: "Unauthorized"}),
    };
  }

  console.log("Authorization successful");

  // Parse the webhook payload
  let body;
  try {
    body = JSON.parse(event.body);
    console.log("Received webhook payload:", JSON.stringify(body, null, 2));
  } catch (error) {
    console.error("Error parsing webhook payload:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({message: "Invalid JSON", error: error.message}),
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
