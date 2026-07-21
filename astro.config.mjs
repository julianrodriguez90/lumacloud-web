// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { redirects } from './redirects.mjs';

export default defineConfig({
  site: 'https://lumacloud.co',
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'never',
  redirects,
  build: {
    // CSS inline en cada HTML: elimina el único request render-blocking (PageSpeed 2026-07-21)
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
