import {defineCliConfig} from "sanity/cli";
import {dataset, projectId} from "@badger3000/sanity";

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  // badger3000.sanity.studio, for `sanity deploy` (an owner step, never CI).
  studioHost: "badger3000",
  deployment: {
    autoUpdates: true,
  },
});
