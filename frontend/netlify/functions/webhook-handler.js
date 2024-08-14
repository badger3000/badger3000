import {indexToAlgolia} from "./algoliaIndexing.js";
import {createHmac} from "crypto";

const verifySignature = (body, signature, secret) => {
  const [timestamp, givenSignature] = signature.split(",");
  const hmac = createHmac("sha256", secret);
  hmac.update(timestamp + "." + body);
  const computedSignature = hmac.digest("hex");
  return givenSignature === `v1=${computedSignature}`;
};

export const handler = async (event, context) => {
  console.log(
    "Received event headers:",
    JSON.stringify(event.headers, null, 2)
  );

  const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;
  const signature = event.headers["sanity-webhook-signature"];

  if (!WEBHOOK_SECRET) {
    console.error("SANITY_WEBHOOK_SECRET is not set in environment variables");
    return {
      statusCode: 500,
      body: JSON.stringify({message: "Server configuration error"}),
    };
  }

  if (!signature) {
    console.error("No Sanity webhook signature found in headers");
    return {
      statusCode: 401,
      body: JSON.stringify({message: "Unauthorized"}),
    };
  }

  const isValid = verifySignature(event.body, signature, WEBHOOK_SECRET);

  if (!isValid) {
    console.error("Invalid webhook signature");
    return {
      statusCode: 401,
      body: JSON.stringify({message: "Unauthorized"}),
    };
  }

  console.log("Webhook signature verified successfully");

  // Parse the webhook payload
  let body;
  try {
    body = JSON.parse(event.body);
    console.log("Parsed webhook payload:", JSON.stringify(body, null, 2));
  } catch (error) {
    console.error("Error parsing webhook payload:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({message: "Invalid JSON", error: error.message}),
    };
  }

  // Extract the event type and document ID from the Sanity webhook payload
  const eventType = event.headers["sanity-operation"];
  const documentId = event.headers["sanity-document-id"];

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
