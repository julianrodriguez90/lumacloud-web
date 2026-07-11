# CLAUDE.md — lumacloud-web

Rediseño de lumacloud.co (Grupo Luma SAS — ciberseguridad y nube empresarial, Bogotá). Astro 6 + Tailwind 4 + Vercel, 100% estático salvo `/api/contact`.

**Antes de trabajar:** el contexto completo del proyecto está en `README.md` (arquitectura, pipeline, workflows) y el estado/pendientes en `docs/ESTADO-PROYECTO.md`. Para features nuevas, leer ambos primero.

## 📌 Regla de mantenimiento de documentación (obligatoria)

Todo cambio que afecte el proyecto se documenta **en el mismo commit o PR**:
- Avance o pendiente nuevo → actualizar `docs/ESTADO-PROYECTO.md` (checkboxes + fecha de "última actualización")
- Cambio de arquitectura, pipeline, convención o workflow → actualizar `README.md`
- Regla nueva, gotcha o patrón para sesiones de IA → actualizar este `CLAUDE.md`
Un cambio sin su documentación actualizada está **incompleto**. Esto aplica también a decisiones tomadas en conversación con el usuario (registrarlas en ESTADO-PROYECTO.md).

## Comandos

- `npm run dev` — dev server :4321
- `npm run build` — build completo (`dist/` + `.vercel/output/` con los redirects 301)
- `npm run extract-wp` — re-extrae todo el WordPress (REST API público) → `content-source/`
- `npm run catalog-media` — reclasifica medios → `content-source/MEDIA-CATALOG.md`
- `npm run wp-to-collection` — corpus → `src/content/blog/*.md` ⚠️ idempotente y destructivo: pisa ediciones manuales de los .md migrados
- `npm run optimize-images` — `scripts/originals/selected/**` → `public/images/**.webp`
- `node scripts/generate-redirects.mjs` — regenera `redirects-posts.generated.mjs`

## Reglas de contenido (innegociables)

1. **Corpus anti-alucinación**: todo dato factual (servicios, tecnologías, certificaciones, capacidades, cifras) debe rastrearse a `content-source/` o al BrandBook. PROHIBIDO inventar: "X años de experiencia", % de ahorro, número de clientes, SLAs no documentados.
2. Datos autorizados sin fuente adicional: datacenters TIER III y IV, CSIRT operativo, soporte 24/7, migración gratuita, sede Cll 121 #15a-50 Bogotá, tel +57 318 595 8261, tecnologías Acronis/Fortinet/FortiSIEM/Proxmox/VMware/Google Gemini/Mandiant/VirusTotal.
3. Testimonios: SOLO los 4 verificados de `src/components/Testimonios.astro`. No agregar ni parafrasear otros.
4. Tono BrandBook: experto pero cercano, tuteo ("protege tu empresa"), directo, sin arrogancia. Español de Colombia.
5. Los datos de empresa (dirección, teléfono, redes) viven SOLO en `src/lib/site.ts` — nunca hardcodearlos en páginas.
6. En temas legales (Ley 1581, ISO): LumaCloud implementa controles técnicos; NO emite certificaciones ni da asesoría legal. Incluir disclaimer donde aplique.

## Reglas SEO (por página, verificadas por auditoría)

- title ≤60 chars, formato `Keyword Principal | LumaCloud`
- description 120–155 chars: keyword + propuesta de valor + CTA suave
- **Exactamente 1 H1** con la keyword (en blog el H1 lo pone la plantilla — los H1 del cuerpo se degradan a H2)
- Las keywords objetivo salen de `Plan_Maestro_pSEO_LumaCloud.docx` (tabla por silo con volumen/KD/URL)
- breadcrumbs prop en BaseLayout + interlinking entre páginas del mismo silo
- Schema por tipo: Service (silos, con `hasOfferCatalog`), Article (blog), SoftwareApplication (herramientas), AboutPage, ContactPage. FAQPage lo emite `FAQSection` automáticamente
- Página nueva = revisar si necesita redirect desde una URL vieja del WP (`redirects.mjs`)

## Diseño

- **Patrón de página de servicio: `src/pages/ciberseguridad/index.astro`** — replicar su estructura (hero split con BrandImage + breadcrumb inline, cards de subservicios, sección detalle con imagen, enlaces de silo, FAQSection 4-5 preguntas, CTASection).
- Tokens en `src/styles/global.css` (@theme): `cold-*` #173A87 primario, `mid-*` #0073FF CTAs, `sky-*` #27CAFF acentos, `ink` #100E16 texto/footer, `frost-*` superficies claras.
- Utilidades propias (usar, no reinventar): `font-display` (Bebas Neue caps), `brand-rule`, `text-brand-gradient`, `bg-blueprint`/`bg-blueprint-dark`, `bg-hero-mesh`, `card-brand`, `animate-rise` + `.stagger`, `scroll-reveal`, `prose-luma` (blog).
- Componentes: `BaseLayout` (title, description, ogImage?, breadcrumbs?, schemas?, noindex?), `BrandImage` (overlay?, priority? → fetchpriority high para LCP), `CTASection`, `FAQSection`, `Testimonios`, `Header`, `Footer`.
- Reglas duras: animaciones solo CSS · solo WebP en `public/images/` · todo `<img>` con width/height · herramientas de `/herramientas/` en JS vanilla cliente · footer oscuro.

## Gotchas de diseño (decisiones del dueño — respetarlas)

- **El diseño vigente es el v1** (hero split con imagen grande, Bebas Neue + Inter, headers centrados con brand-rule, cards con glow). Un rediseño v2 "Swiss-technical" (mono labels, hero editorial de imagen pequeña, diagramas SVG isométricos, layout plano/blanco) fue **rechazado explícitamente por el dueño** y revertido (ver `docs/ESTADO-PROYECTO.md`). No reintentar esa dirección; cualquier mejora visual se itera SOBRE el v1 y prefiere más color/profundidad, no minimalismo blanco.
- Al dueño le gustan: imágenes grandes y protagonistas, chips flotantes sobre imágenes, gradientes de marca, fondos frost/oscuros alternados.

## Gotchas

- **No subir a Astro 7 ni Tailwind 4.3+** sin probar (pins deliberados; `@astrojs/vercel@10` = Astro 6, @11 = Astro 7).
- WP REST `/wp-json/wp/v2/pages` da **500 en lotes** — `extract-wp.mjs` baja IDs uno a uno. Las páginas Gonemo/LCI solo salen por scraping HTML (guardadas como `.html` en `content-source/pages/`).
- `redirects-posts.generated.mjs` es GENERADO — no editar a mano; `redirects.mjs` (páginas) sí es manual. Los 301 solo se ven en `.vercel/output/config.json`, no funcionan en `npm run preview`.
- Gitignored por peso: `LUMA - BrandBook.pdf` (20MB), `scripts/originals/` (251MB), `.claire/`. Si no existen localmente, re-descargar con `npm run extract-wp` (el BrandBook lo tiene Julián).
- `/api/contact` sin `RESEND_API_KEY` responde 503 con mensaje amigable — esperado en dev. Honeypot: campo `website`.
- El post `hhhol` del WP es basura y está excluido en `wp-to-collection.mjs` (EXCLUDE set).
- El screenshot del preview browser falla en secciones con scroll: agrandar el viewport (p. ej. 1280×6000) y capturar en scroll 0 para revisar una página completa.
- Build con Node 25 avisa que Vercel usará Node 24 — inofensivo.

## Verificación antes de dar algo por terminado

1. `npm run build` sin errores
2. Auditoría rápida sobre `dist/client/`: 1 H1 por página, title/description en rango, canonical presente
3. Si el cambio es visual: verificar en el preview browser (desktop + mobile 375px)
4. Si toca herramientas o formulario: probarlos interactivamente en el navegador
5. **Actualizar la documentación** (ver regla de mantenimiento arriba)
