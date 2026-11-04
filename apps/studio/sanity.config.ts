// The standalone Studio (`sanity dev` / `sanity build`). The schema lives in
// @badger3000/sanity; project and dataset are its non-secret constants,
// because a standalone build only exposes SANITY_STUDIO_* env to the browser.
import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";
import {colorInput} from "@sanity/color-input";
import {dataset, projectId} from "@badger3000/sanity";
import {schemaTypes} from "@badger3000/sanity/schema";
import {bookmarkStructure} from "./structure/bookmarkStructure";

export default defineConfig({
  name: "default",
  title: "Badger3000 Articles",

  projectId,
  dataset,

  plugins: [structureTool({structure: bookmarkStructure}), visionTool(), colorInput()],

  schema: {
    types: schemaTypes,
  },
});
