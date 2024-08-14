export default {
  trailingComma: "es5",
  semi: false,
  singleQuote: true,
  tailwindConfig: "./tailwind.config.mjs",
  plugins: [
    require("prettier-plugin-tailwindcss"),
    require("prettier-plugin-astro"),
  ],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
