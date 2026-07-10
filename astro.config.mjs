// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import tailwindcss from '@tailwindcss/vite';
import { redirects } from './redirects.mjs';

export default defineConfig({
  site: 'https://lumacloud.co',
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'never',
  redirects,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
    partytown({
      config: { forward: ['dataLayer.push'] },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
