// sanity.config.ts
import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";
import {schemaTypes} from "./schemas";
import {sanityConfig} from "./sanityConfig";

export default defineConfig({
  name: "default",
  title: "Badger3000 Articles",

  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },

  basePath: "/studio",
});
