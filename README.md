# lumacloud-web

Rediseño completo de [lumacloud.co](https://lumacloud.co) — Astro 6 + Tailwind 4, desplegado en Vercel.

## Stack

- **Astro 6** (`output: static`) con adaptador Vercel — único endpoint server-side: `/api/contact` (Resend)
- **Tailwind 4** vía `@tailwindcss/vite` — tokens de marca en `src/styles/global.css` (@theme)
- **Content Collections** — blog migrado del WordPress (88 artículos) en `src/content/blog/`
- Tipografías self-hosted: Bebas Neue (display) + Inter Variable (texto)
- GA4 vía Partytown, sitemap automático, JSON-LD en `BaseLayout`

## Comandos

```bash
npm run dev              # dev server en :4321
npm run build            # build de producción (dist/ + .vercel/)
npm run extract-wp       # re-extrae contenido del WP vía REST API → content-source/
npm run catalog-media    # clasifica los medios extraídos → MEDIA-CATALOG.md
npm run wp-to-collection # convierte posts extraídos → src/content/blog/*.md
npm run optimize-images  # scripts/originals/selected/ → public/images/*.webp
node scripts/generate-redirects.mjs  # regenera redirects 301 de posts
```

## Estructura de contenido

- `content-source/` — corpus extraído del WordPress (fuente de verdad anti-alucinación: todo dato factual de la web debe rastrearse aquí o al BrandBook)
- `scripts/originals/` — imágenes originales (no en git); solo los WebP optimizados van a `public/images/`
- `redirects.mjs` + `redirects-posts.generated.mjs` — 301 WordPress → Astro (se materializan en el build de Vercel)

## Variables de entorno

Ver `.env.example`: `RESEND_API_KEY` (formulario de contacto), `PUBLIC_GA4_ID` (analytics, opcional).

## Docs

- `docs/RESPALDO-WORDPRESS.md` — cómo respaldar el WP antes del cutover de DNS
- `docs/superpowers/specs/2026-05-13-lumacloud-rebuild-design.md` — spec técnico del rebuild
- `Plan_Maestro_pSEO_LumaCloud.docx` — estrategia SEO (silos, keywords, roadmap)
