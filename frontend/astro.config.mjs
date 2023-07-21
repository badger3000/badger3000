import { defineConfig } from 'astro/config'
import image from '@astrojs/image'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'
import alpinejs from '@astrojs/alpinejs'

import sanity from 'astro-sanity'
// Sanity project info
import sitemap from '@astrojs/sitemap'
const SANITY_PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID
const SANITY_DATASET = import.meta.env.VITE_SANITY_DATASET
const SANITY_TOKEN = import.meta.env.VITE_SANITY_TOKEN

export default defineConfig({
  site: 'https://badger3000.com/',
  experimental: {
    assets: true,
  },
  integrations: [
    tailwind(),
    image({
      serviceEntryPoint: '@astrojs/image/sharp',
    }),
    react(),
    alpinejs(),
    sanity({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      token: SANITY_TOKEN,
      apiVersion: '2021-03-25',
      useCdn: true,
    }),
    sitemap(),
  ],
})
