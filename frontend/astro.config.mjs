import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import alpinejs from '@astrojs/alpinejs';
import react from '@astrojs/react';
// Sanity project info
import sitemap from '@astrojs/sitemap';
import sanity from "@sanity/astro";
const SANITY_PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID;
const SANITY_DATASET = import.meta.env.VITE_SANITY_DATASET;
const SANITY_TOKEN = import.meta.env.VITE_SANITY_TOKEN;

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false
  },
  site: 'https://badger3000.com/',
  integrations: [tailwind(
    {
      applyBaseStyles: false,
    }
    ), alpinejs(), sanity({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    token: SANITY_TOKEN,
    apiVersion: '2021-03-25',
    useCdn: true
  }), sitemap(),react()],
  vite: {
    define: {
      'import.meta.env.PUBLIC_MY_ALGOLIA_APP_ID': JSON.stringify(process.env.MY_ALGOLIA_APP_ID),
      'import.meta.env.PUBLIC_MY_ALGOLIA_SEARCH_API_KEY': JSON.stringify(process.env.MY_ALGOLIA_SEARCH_API_KEY),
      'import.meta.env.PUBLIC_MY_INDEX_NAME_CODEPENS': JSON.stringify(process.env.MY_INDEX_NAME_CODEPENS),
      'import.meta.env.PUBLIC_MY_INDEX_NAME_POSTS': JSON.stringify(process.env.MY_INDEX_NAME_POSTS),
      'import.meta.env.PUBLIC_MY_INDEX_NAME_PROJECTS': JSON.stringify(process.env.MY_INDEX_NAME_PROJECTS),
    },
    plugins: [
      {
        name: 'prettier-plugin-tailwindcss',
        enforce: 'pre',
        apply: 'build',
        transform(code, id) {
          if (id.endsWith('.astro')) {
            return code;
          }
        },
      },
    ],
  },
});