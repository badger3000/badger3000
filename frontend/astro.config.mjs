import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import alpinejs from '@astrojs/alpinejs';
import sanity from 'astro-sanity';
// Sanity project info
import sitemap from '@astrojs/sitemap';
import sanity from "@sanity/astro";
const SANITY_PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID;
const SANITY_DATASET = import.meta.env.VITE_SANITY_DATASET;
const SANITY_TOKEN = import.meta.env.VITE_SANITY_TOKEN;

// https://astro.build/config
export default defineConfig({
  site: 'https://badger3000.com/',
  integrations: [tailwind(), alpinejs(), sanity({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    token: SANITY_TOKEN,
    apiVersion: '2021-03-25',
    useCdn: true
  }), sitemap()]
});