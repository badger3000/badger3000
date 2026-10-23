// sanity.config.ts
import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";
import {schemaTypes} from "@badger3000/sanity/schema";
import {bookmarkStructure} from "./schemas/structure/bookmarkStructure";

// One env name set for both stacks; see docs/adr/0010-public-env-prefix.md.
const projectId =
  process.env.SANITY_STUDIO_API_PROJECT_ID ||
  process.env.PUBLIC_SANITY_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset =
  process.env.SANITY_STUDIO_API_DATASET ||
  process.env.PUBLIC_SANITY_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET;

// Check for missing environment variables during initialization
if (!projectId || !dataset) {
  throw new Error(
    `Missing required environment variables. Check if PUBLIC_SANITY_PROJECT_ID and PUBLIC_SANITY_DATASET are set.`
  );
}
export default defineConfig({
  name: "default",
  title: "Badger3000 Articles",

  projectId,
  dataset,

  plugins: [structureTool({structure: bookmarkStructure}), visionTool()],

  schema: {
    types: schemaTypes,
  },

  basePath: "/studio",
});
