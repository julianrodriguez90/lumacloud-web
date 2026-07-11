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

## Diseño — v2 "Swiss-technical" (julio 2026)

**Dirección**: "el SOC hecho página" — retícula suiza con asimetría deliberada, secciones numeradas editoriales (01/, 02/…), acentos monospace (lenguaje terminal/SOC), duotono de marca en fotografía, precisión en cada detalle. Nada de estética "SaaS burbuja": radios contenidos, sombras secas, motion artesanal.

- **Tres voces tipográficas** (self-hosted en `public/fonts/`): Bebas Neue (`font-display`, títulos display caps, escala GRANDE), **Instrument Sans** (`--font-sans`, cuerpo — NO volver a Inter), **IBM Plex Mono** (`--font-mono`, labels/datos/eyebrows).
- Tokens en `src/styles/global.css` (@theme): `cold-*` #173A87 primario, `mid-*` #0073FF CTAs, `sky-*` #27CAFF acentos, `ink` #100E16, `frost-*` superficies. La escala de radios está remapeada a valores precisos (2xl = 10px) — no usar rounded-full en cards.
- Utilidades propias (usar, no reinventar): `mono-label` (eyebrow técnico — SIEMPRE en vez de `uppercase tracking-[…]`), `mono-data` (cifras/coordenadas), `font-display`, `brand-rule`, `text-brand-gradient`, `bg-blueprint`/`-dark`, `bg-hero-mesh`, `card-brand`, `corner-ticks` (marcas + de retícula), `img-duotone`, `link-tech` (subrayado deslizante), `animate-rise` + `.stagger`, `animate-wipe` (revelado de imagen), `scroll-reveal`, `animate-marquee`, `prose-luma`.
- Componentes: `BaseLayout`, `SectionHeader` (num/eyebrow/title/lead — encabezado editorial numerado, usarlo en secciones nuevas en vez de headers centrados), `BrandImage` (overlay?, duotone?, priority?), `DiagramStack`/`DiagramRadar` (SVG técnicos hechos a mano ~2KB — preferirlos sobre fotos stock), `CTASection`, `FAQSection` (num?), `Testimonios` (num?, layout editorial), `Header`, `Footer` (wordmark gigante).
- Detalles de firma: línea de estado mono en heros (`SOC://ACTIVO · BOG 4.6972°N`), fichas técnicas flotantes sobre imágenes (`IMG/01 — …`), listas editoriales con divisores en vez de grids de cards, carrusel scroll-snap en mobile para grids grandes.
- Reglas duras: animaciones solo CSS (respetan reduced-motion) · solo WebP + width/height · fotografía SIEMPRE con `duotone` o `overlay` (nunca stock crudo) · herramientas en JS vanilla · footer oscuro · patrón de referencia actualizado: `src/pages/index.astro`.

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
