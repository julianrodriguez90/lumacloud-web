import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
// sitemap se activa cuando Supabase esté configurado y haya rutas pSEO reales
// import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lumacloud.co',
  integrations: [
    tailwind(),
    // sitemap(), // TODO: re-activar con PUBLIC_SUPABASE_URL configurado
  ],
  output: 'static',
});
