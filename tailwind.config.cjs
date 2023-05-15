/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        // Simple 16 column grid
        16: 'repeat(16, minmax(0, 1fr))',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans'],
      },
      container: {
        center: true,
      },
      screens: {
        sm: '540px',
        // => @media (min-width: 640px) { ... }

        md: '840px',
        // => @media (min-width: 768px) { ... }

        lg: '1140px',
        // => @media (min-width: 1024px) { ... }

        xl: '1140px',
        // => @media (min-width: 1280px) { ... }

        '2xl': '1140px',
        // => @media (min-width: 1536px) { ... }
      },
    },
  },
  plugins: [],
}
