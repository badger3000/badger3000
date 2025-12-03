// sanity.config.ts
import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";
import {schemaTypes} from "./schemas";

// Check for both naming conventions to support both Next.js and Sanity Studio
const projectId =
  process.env.SANITY_STUDIO_API_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset =
  process.env.SANITY_STUDIO_API_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET;

// Check for missing environment variables during initialization
if (!projectId || !dataset) {
  throw new Error(
    `Missing required environment variables. Check if NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET are set.`
  );
}
export default defineConfig({
  name: "default",
  title: "Badger3000 Articles",

  projectId,
  dataset,

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },

  basePath: "/studio",
});
