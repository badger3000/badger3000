import js from "@eslint/js";
import globals from "globals";
import nextPlugin from "eslint-config-next";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.claude/**",
      "**/dist/**",
      "**/build/**",
      "*.config.js",
      "**/TestimonialCarousel.tsx",
      // Standalone bundles with their own toolchains, not part of the Next app:
      // a Chrome extension (uses the `chrome.*` WebExtension globals) and the
      // Sanity Studio schema sources consumed by sanity.config.ts.
      "extensions/**",
      "schemas/**",
    ],
  },
  {
    extends: [
      js.configs.recommended,
      nextPlugin,
      ...tseslint.configs.recommended,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/set-state-in-effect": "off",
      "no-use-before-define": "off",
    },
  },
  {
    extends: [js.configs.recommended, nextPlugin],
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  }
);
