/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    colors: {
      transparent: 'transparent',
      white: '#ffffff',
      primary: '#DFEBED',
      secondary: '#F78536',
      neutral: '#497285',
      dark: '#2B4450',
    },
    extend: {
      dropShadow: {
        '3xl': '0px 16px 14px -14px rgba(255, 255, 255, 1);',
      },
      fontFamily: {
        sans: ['Cera Round Pro'],
      },
      container: {
        center: true,
      },
      screens: {
        sm: '540px',
        // => @media (min-width: 640px) { ... }

        md: '840px',
        // => @media (min-width: 768px) { ... }

        lg: '1024px',
        // => @media (min-width: 1024px) { ... }

        xl: '1280px',
        // => @media (min-width: 1280px) { ... }

        '2xl': '1280px',
        // => @media (min-width: 1536px) { ... }
      },
    },
  },
  plugins: [],
}
