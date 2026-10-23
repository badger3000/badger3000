import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist/**", ".astro/**", ".wrangler/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  { languageOptions: { globals: { ...globals.browser } } },
  { files: ["scripts/**", "astro.config.mjs"], languageOptions: { globals: { ...globals.node } } },
  { rules: { "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }] } },
);
