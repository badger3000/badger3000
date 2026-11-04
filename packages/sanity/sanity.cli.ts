// Only for `sanity typegen generate` (the `typegen` script): the CLI needs a
// project root to run in. The Studio's own CLI config is apps/studio/sanity.cli.ts.
import {defineCliConfig} from "sanity/cli";
import {dataset, projectId} from "./src/index.ts";

export default defineCliConfig({
  api: {projectId, dataset},
  typegen: {
    path: "./src/queries/**/*.ts",
    // Written by `pnpm --filter @badger3000/studio run schema:extract`.
    schema: "./schema.json",
    generates: "./src/sanity.types.ts",
    overloadClientMethods: true,
  },
});
