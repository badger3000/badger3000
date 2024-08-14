import {indexToAlgolia} from "./algoliaIndexing.js";
import crypto from "crypto";

const verifySignature = (body, signature, secret) => {
  console.log("Verifying signature...");
  console.log("Received signature:", signature);

  const [timestampStr, signatureHash] = signature.split(",");
  const timestamp = timestampStr.split("=")[1];

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(timestamp + "." + body);
  const expectedSignature = hmac.digest("hex");

  console.log("Expected signature:", expectedSignature);
  console.log("Received signature hash:", signatureHash.split("=")[1]);

  const isValid = expectedSignature === signatureHash.split("=")[1];

  console.log("Signature valid:", isValid);
  return isValid;
};
export const handler = async (event, context) => {
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
    return {statusCode: 401, body: JSON.stringify({message: "Unauthorized"})};
  }

  const isValid = verifySignature(event.body, signature, WEBHOOK_SECRET);

  if (!isValid) {
    console.error("Invalid webhook signature");
    return {statusCode: 401, body: JSON.stringify({message: "Unauthorized"})};
  }

  console.log("Webhook signature verified successfully");

  // Parse the webhook payload
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    console.error("Error parsing webhook payload:", error);
    return {statusCode: 400, body: JSON.stringify({message: "Invalid JSON"})};
  }

  const eventType = event.headers["sanity-operation"];
  const documentId = event.headers["sanity-document-id"];

  if (["create", "update", "delete"].includes(eventType)) {
    try {
      await indexToAlgolia(eventType, documentId);
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
        }),
      };
    }
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify({message: "Event type not relevant for indexing"}),
    };
  }
};
