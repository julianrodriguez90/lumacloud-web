# CLAUDE.md — lumacloud-web

Rediseño de lumacloud.co (Grupo Luma SAS — ciberseguridad y nube, Bogotá). Astro 6 + Tailwind 4 + Vercel.
Estado completo del proyecto y pendientes: **`docs/ESTADO-PROYECTO.md`** (leerlo antes de trabajar en features nuevas).

## Comandos

- `npm run dev` — dev server :4321 · `npm run build` — build a `dist/` + `.vercel/`
- `npm run extract-wp` — re-extrae contenido del WP (REST API público) → `content-source/`
- `npm run wp-to-collection` — posts extraídos → `src/content/blog/*.md` (idempotente, regenera todo)
- `npm run optimize-images` — `scripts/originals/selected/**` → `public/images/**.webp`
- `node scripts/generate-redirects.mjs` — regenera `redirects-posts.generated.mjs`

## Reglas de contenido (innegociables)

- **Corpus anti-alucinación**: todo dato factual (servicios, tecnologías, certificaciones, cifras) debe rastrearse a `content-source/` o al BrandBook. PROHIBIDO inventar: "X años de experiencia", % de ahorro, nº de clientes.
- Datos autorizados sin fuente adicional: datacenters TIER III y IV, CSIRT operativo, soporte 24/7, migración gratuita, sede Cll 121 #15a-50 Bogotá.
- Tono BrandBook: experto pero cercano, tuteo, directo, español de Colombia.
- SEO por página: title ≤60 chars, description 120–155, exactamente 1 H1 con keyword (las keywords vienen de `Plan_Maestro_pSEO_LumaCloud.docx`), breadcrumbs prop, schema por tipo (Service/Article/SoftwareApplication).

## Diseño

- **Patrón de página de servicio**: `src/pages/ciberseguridad/index.astro` — replicar su estructura para páginas nuevas.
- Tokens en `src/styles/global.css` (@theme): colores `cold-*` (#173A87), `mid-*` (#0073FF), `sky-*` (#27CAFF), `ink` (#100E16), `frost-*`. Utilidades propias: `font-display`, `brand-rule`, `bg-blueprint`, `bg-blueprint-dark`, `bg-hero-mesh`, `card-brand`, `text-brand-gradient`, `animate-rise`, `scroll-reveal`, `.stagger`.
- Componentes: `BaseLayout` (SEO + JSON-LD), `Header`, `Footer`, `BrandImage`, `CTASection`, `FAQSection` (emite FAQPage schema), `Testimonios`.
- Tipografías self-hosted en `public/fonts/`: Bebas Neue (display, títulos en mayúsculas) + Inter Variable (cuerpo). Solo WebP en `public/images/`, siempre con `width`/`height`.
- Animaciones CSS puro (cero JS de animación). Herramientas de `/herramientas/` = JS vanilla en cliente.

## Gotchas

- **No subir a Astro 7 ni Tailwind 4.3+** sin probar: versiones fijadas por compatibilidad (`@astrojs/vercel@10` = Astro 6).
- El endpoint WP `/wp-json/wp/v2/pages` devuelve 500 en lotes — `extract-wp.mjs` baja los IDs uno a uno; las páginas Gonemo solo salen por scraping HTML (Elementor rompe el API).
- En posts del blog los H1 del cuerpo se degradan a H2 (el H1 lo pone la plantilla) — ya lo hace `wp-to-collection.mjs`.
- `redirects.mjs` importa `redirects-posts.generated.mjs` (generado, no editar a mano). Los 301 se materializan en `.vercel/output/config.json` al hacer build.
- Gitignored por peso: `LUMA - BrandBook.pdf`, `scripts/originals/` (251MB de originales del WP), `.claire/`.
- Único endpoint server-side: `src/pages/api/contact.ts` (Resend; sin `RESEND_API_KEY` responde 503 con mensaje amigable — comportamiento esperado en dev).
- El screenshot del preview browser captura mal las secciones con scroll: para revisar visualmente una página completa, agrandar el viewport (p. ej. 1280×6000) y capturar en scroll 0.
