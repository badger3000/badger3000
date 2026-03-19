import {defineCliConfig} from "sanity/cli";

const projectId =
  process.env.SANITY_STUDIO_API_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset =
  process.env.SANITY_STUDIO_API_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET;

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
});
