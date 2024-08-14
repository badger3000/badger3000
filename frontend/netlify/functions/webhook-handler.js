import {indexToAlgolia} from "./algoliaIndexing.js";
import {createHmac} from "crypto";

const verifySignature = (body, signature, secret) => {
  console.log("Verifying signature...");
  console.log("Received signature:", signature);

  const [timestamp, givenSignature] = signature.split(",");
  console.log("Extracted timestamp:", timestamp);
  console.log("Extracted given signature:", givenSignature);

  const hmac = createHmac("sha256", secret);
  const stringToSign = `${timestamp}.${body}`;
  console.log("String to sign:", stringToSign);

  hmac.update(stringToSign);
  const computedSignature = `v1=${hmac.digest("hex")}`;
  console.log("Computed signature:", computedSignature);

  const isValid = givenSignature === computedSignature;
  console.log("Signature valid:", isValid);

  return isValid;
};

export const handler = async (event, context) => {
  console.log(
    "Received event headers:",
    JSON.stringify(event.headers, null, 2)
  );
  console.log("Received event body:", event.body);

  const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;
  console.log(
    "SANITY_WEBHOOK_SECRET length:",
    WEBHOOK_SECRET ? WEBHOOK_SECRET.length : "undefined"
  );

  const signature = event.headers["sanity-webhook-signature"];
  console.log("Received signature:", signature);

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

  const eventType = event.headers["sanity-operation"];
  const documentId = event.headers["sanity-document-id"];

  console.log(`Event type: ${eventType}, Document ID: ${documentId}`);

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
