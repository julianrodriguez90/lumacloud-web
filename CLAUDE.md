# CLAUDE.md — lumacloud-web

Rediseño de lumacloud.co (Grupo Luma SAS — ciberseguridad y nube empresarial, Bogotá). Astro 6 + Tailwind 4 + Vercel, 100% estático salvo `/api/contact`.

**Antes de trabajar:** el contexto completo del proyecto está en `README.md` (arquitectura, pipeline, workflows) y el estado/pendientes en `docs/ESTADO-PROYECTO.md`. Para features nuevas, leer ambos primero.

## 🔄 Cómo retomar el proyecto en una sesión nueva

1. **Rama de trabajo: `master`** (única rama del repo). El rediseño se hizo originalmente en `redesign/astro-rebuild` vía PRs #2-#7, pero esa rama ya se fusionó por completo y fue **borrada** (local + remoto) tras quedar obsoleta — todo el trabajo posterior a la fusión se hace directo sobre `master`. Si en algún momento aparece de nuevo una rama de feature de larga duración, documentarlo aquí explícitamente para que no se repita esta confusión.
2. `git log --oneline -5` para ver los últimos cambios; `git status` debe salir limpio y sincronizado con `origin/master`.
3. `npm install && npm run dev` → sitio en `localhost:4321`.
4. Leer `docs/ESTADO-PROYECTO.md` completo — es el documento vivo de qué está hecho y qué falta. Los dos frentes de trabajo abiertos ahora mismo son: (a) contenido SEO Fase 1 (8 artículos evergreen + ~11 subpáginas comerciales, ver sección "Qué nos hace falta") y (b) el checklist de lanzamiento a producción (respaldo WP, Resend, deploy, DNS).
5. No asumir que el dueño quiere más cambios visuales grandes: ya hubo un rediseño (v2) explícitamente rechazado y revertido — ver "Gotchas de diseño" abajo antes de proponer nada estético.

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
7. **Estadísticas externas citables** (verificadas contra la fuente primaria, se usan vía `StatCallout.astro` con link a la fuente):
   - MinTIC / ColCERT — *Informe de Tendencias de Amenazas Cibernéticas 2025*: el fraude (phishing + uso no autorizado de cuentas de correo) representó el **79,8%** de los incidentes gestionados por ColCERT en 2024-2025 (835 casos de phishing, 784 de uso no autorizado de correo); ColCERT gestionó 697 incidentes en 2025 vs. 1.427 en 2024 (reducción del 48,84%), ampliando su monitoreo de 31 a ~1.300 entidades y 35.000 páginas web. Fuente: https://www.mintic.gov.co/portal/inicio/Sala-de-prensa/Noticias/433511
   - Para añadir una nueva estadística externa: verificarla contra la página oficial primaria (no solo un resumen de búsqueda), añadirla aquí con la cifra exacta + URL, y usar `StatCallout`.

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
- Utilidades propias (usar, no reinventar): `font-display` (Bebas Neue caps), `brand-rule`, `text-brand-gradient`, `bg-blueprint`/`bg-blueprint-dark`, `bg-hero-mesh`, `card-brand`, `animate-rise` + `.stagger`, `scroll-reveal`, `prose-luma` (blog), `animate-marquee` (loop continuo, pausa en hover — usar SIEMPRE con 2 copias del contenido, solo la 2ª con `aria-hidden`), `animate-rise-float` (entrada + flotación continua combinadas — **nunca** apilar `animate-rise` + `animate-float` por separado: ambas usan el shorthand `animation` y la segunda pisa a la primera), `parallax-hero` (scroll-driven `animation-timeline: scroll()`, envolver la imagen del hero).
- **Patrón de stagger correcto**: `.stagger` en el contenedor (pone `animation-delay` por `nth-child`) + `.scroll-reveal` en CADA hijo individual (la animación real). `.scroll-reveal` solo en el contenedor = un solo bloque que revela junto, no cascada.
- Componentes: `BaseLayout` (title, description, ogImage?, breadcrumbs?, schemas?, noindex?), `BrandImage` (overlay?, priority? → fetchpriority high para LCP), `StatCallout` (stat, label, source, sourceUrl — estadística citada externa, cifra debe estar en la lista de "Estadísticas externas citables" arriba), `CTASection`, `FAQSection`, `Testimonios`, `Header`, `Footer`.
- Reglas duras: animaciones solo CSS · solo WebP en `public/images/` · todo `<img>` con width/height · herramientas de `/herramientas/` en JS vanilla cliente · footer oscuro.
- **Analítica y leads (patrón obligatorio)**: eventos GA4 vía `src/lib/analytics.ts` — en elementos estáticos usar `data-track="<evento>"` + `data-track-<param>` (listener global en BaseLayout, agrega `page` solo); en scripts procesados importar `track()`/`appendAttribution()` de `@/lib/analytics`; en scripts inline (`define:vars`) usar `window.lumaTrack?.()` (no pueden importar módulos). Taxonomía de eventos en README §8 — no inventar nombres nuevos sin registrarlos ahí. Todo formulario nuevo de lead postea a `/api/contact` (con `source` propio + honeypot `website` + `appendAttribution`) y dispara `generate_lead` al éxito / `form_error` al fallo; el endpoint despacha a Resend y Zoho CRM en paralelo (cliente en `src/lib/zoho.ts`, env vars `ZOHO_*`).
- **Tap targets ≥44×44px en todo elemento interactivo** (links, botones, radios/checkboxes, chips de filtro): patrón `flex min-h-11 items-center` en el elemento clicable, no solo padding en el texto. Nace de la auditoría mobile de julio 2026 que encontró el menú móvil, el footer y los radios de `evaluador-iso-27001` muy por debajo del mínimo — no reintroducir links de solo-texto sin altura mínima garantizada.

## Gotchas de diseño (decisiones del dueño — respetarlas)

- **El diseño vigente es el v1** (hero split con imagen grande, Bebas Neue + Inter, headers centrados con brand-rule, cards con glow). Un rediseño v2 "Swiss-technical" (mono labels, hero editorial de imagen pequeña, diagramas SVG isométricos, layout plano/blanco) fue **rechazado explícitamente por el dueño** y revertido (ver `docs/ESTADO-PROYECTO.md`). No reintentar esa dirección; cualquier mejora visual se itera SOBRE el v1 y prefiere más color/profundidad, no minimalismo blanco.
- Al dueño le gustan: imágenes grandes y protagonistas, chips flotantes sobre imágenes, gradientes de marca, fondos frost/oscuros alternados.

## Gotchas

- **No subir a Astro 7 ni Tailwind 4.3+** sin probar (pins deliberados; `@astrojs/vercel@10` = Astro 6, @11 = Astro 7).
- **No reintroducir Partytown**: se eliminó el 2026-07-15 porque nunca ejecutó los scripts de GA4 (quedaban en `type="text/partytown"` sin pasar a `-x`, sin hits ni cookies, tanto en dev como en Vercel). GA4 carga con gtag **diferido a `window.load`** en BaseLayout (2026-07-21, por LCP/PageSpeed) — no volverlo a async directo sin medir con Lighthouse.
- **Heroes con fondo CSS (`background-image`)**: el navegador los descubre tarde y castiga el LCP. Pasar los fondos por la prop `preloadImages` de BaseLayout (`[{ href, media }]` → `<link rel="preload" as="image" fetchpriority="high">`), como hace el home con `home-background[-mobile].webp`.
- WP REST `/wp-json/wp/v2/pages` da **500 en lotes** — `extract-wp.mjs` baja IDs uno a uno. Las páginas Gonemo/LCI solo salen por scraping HTML (guardadas como `.html` en `content-source/pages/`).
- `redirects-posts.generated.mjs` es GENERADO — no editar a mano; `redirects.mjs` (páginas) sí es manual. Los 301 solo se ven en `.vercel/output/config.json`, no funcionan en `npm run preview`.
- Gitignored por peso: `LUMA - BrandBook.pdf` (20MB), `scripts/originals/` (251MB), `.claire/`. Si no existen localmente, re-descargar con `npm run extract-wp` (el BrandBook lo tiene Julián).
- `/api/contact` sin `RESEND_API_KEY` **ni** credenciales Zoho responde 503 con mensaje amigable — esperado en dev. Con al menos un canal configurado responde 200 si ese canal funciona (el fallo del otro solo queda en logs). Honeypot: campo `website`.
- Astro rechaza POSTs sin header `Origin` coincidente (CSRF check de Astro): para probar `/api/contact` con curl agregar `-H "Origin: http://localhost:4321"`.
- El post `hhhol` del WP es basura y está excluido en `wp-to-collection.mjs` (EXCLUDE set).
- El screenshot del preview browser falla en secciones con scroll: agrandar el viewport (p. ej. 1280×6000) y capturar en scroll 0 para revisar una página completa.
- Build con Node 25 avisa que Vercel usará Node 24 — inofensivo.

## Verificación antes de dar algo por terminado

1. `npm run build` sin errores
2. Auditoría rápida sobre `dist/client/`: 1 H1 por página, title/description en rango, canonical presente
3. Si el cambio es visual: verificar en el preview browser (desktop + mobile 375px), incluyendo que cualquier link/botón/radio nuevo mida ≥44×44px (`el.getBoundingClientRect()` vía `javascript_tool`)
4. Si toca herramientas o formulario: probarlos interactivamente en el navegador
5. **Actualizar la documentación** (ver regla de mantenimiento arriba)
