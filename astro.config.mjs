import { defineConfig } from 'astro/config';
import image from '@astrojs/image';
import tailwind from '@astrojs/tailwind';

import react from "@astrojs/react";

// https://astro.build/config
import alpinejs from "@astrojs/alpinejs";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), image({
    serviceEntryPoint: '@astrojs/image/sharp'
  }), react(), alpinejs()]
});