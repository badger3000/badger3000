// Tailwind v4 ships its own PostCSS integration (Lightning CSS), which also
// handles `@import` inlining and vendor prefixing. autoprefixer/postcss-import
// are no longer needed.
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
