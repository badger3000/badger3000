// sanity.client.js
import {createClient} from "@sanity/client";

// For Next.js, these will be exposed to the browser if prefixed with NEXT_PUBLIC_
// Variables must be prefixed this way in your .env file too
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2023-05-03", // Use the latest API version
  useCdn: process.env.NODE_ENV === "production", // Use CDN in production
});

export default client;
