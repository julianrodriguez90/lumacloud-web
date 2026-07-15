# lumacloud-web — Rediseño de lumacloud.co

Sitio web nuevo de **LumaCloud** (Grupo Luma SAS — empresa colombiana de ciberseguridad y nube empresarial, Bogotá), construido en Astro para reemplazar el WordPress actual.

> **⚠️ Regla de oro del repo:** cualquier cambio que afecte el proyecto (arquitectura, contenido, SEO, diseño, dependencias, decisiones) **debe reflejarse en la documentación**: el estado y pendientes en [`docs/ESTADO-PROYECTO.md`](docs/ESTADO-PROYECTO.md), las convenciones en este README y las reglas para IA en [`CLAUDE.md`](CLAUDE.md). Si haces un cambio y no actualizas los docs, el cambio está incompleto.

---

## 1. Contexto de negocio (por qué existe este proyecto)

- **LumaCloud** vende: ciberseguridad administrada (Acronis), backup/DRP, cloud privado/público/híbrido, SOC 24/7 (Fortinet/FortiSIEM), cumplimiento (ISO 27001, Ley 1581), servicios profesionales TI, CSIRT y Gonemo (plataforma de agentes IA).
- **El problema**: el WordPress actual tiene LCP móvil de **25.9s**, 88% de tráfico de marca y ~19 visitas orgánicas no-marca/mes. Los competidores (datos101.com, cloudseguro.co, hostdime.com.co) capturan 3-20× más keywords.
- **La estrategia**: rediseño total en Astro (estático = rápido) + arquitectura de contenido en 5 silos SEO definida en `Plan_Maestro_pSEO_LumaCloud.docx` (diagnóstico Semrush, keywords con volumen/KD, roadmap de 12 meses).
- **Regla editorial**: todo dato factual del sitio debe rastrearse al corpus extraído del WordPress (`content-source/`) o al BrandBook. **Nunca inventar cifras** ("X años de experiencia", "% de ahorro", "N clientes") — no tienen respaldo verificable.
- **Marca** (de `LUMA - BrandBook.pdf`, 44 págs, no está en git por peso): colores Cold Blue `#173A87`, Mid Blue `#0073FF`, White Blue `#27CAFF`, Grey B `#100E16`; tipografías Bebas Neue (títulos) + Open Sans (modernizada a Inter en la web); esencia "Tranquilidad, Innovación, Seguridad"; arquetipo Creador; voz experta-cercana con tuteo.

## 2. Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # produce dist/ y .vercel/output/ (incluye los redirects 301)
npm run preview    # sirve el build
```

Variables de entorno (`.env`, ver `.env.example`):

| Variable | Para qué | Estado |
|---|---|---|
| `RESEND_API_KEY` | Envío de leads por email a info@lumacloud.co | ⚠️ Pendiente: crear cuenta en resend.com y verificar dominio |
| `PUBLIC_GA4_ID` | Google Analytics 4 (gtag async; sin la variable no se carga nada) | ✅ Configurada en Vercel (2026-07-15) |
| `ZOHO_CLIENT_ID` | Zoho CRM: creación de Leads desde los formularios | ⚠️ Pendiente: self-client en api-console.zoho.com |
| `ZOHO_CLIENT_SECRET` | Zoho CRM (par del client id) | ⚠️ Pendiente |
| `ZOHO_REFRESH_TOKEN` | Zoho CRM: token permanente (scope `ZohoCRM.modules.leads.CREATE`) | ⚠️ Pendiente |
| `ZOHO_ACCOUNTS_URL` / `ZOHO_API_URL` | Solo si el DC de Zoho no es `.com` (defaults: accounts.zoho.com / www.zohoapis.com) | Opcional |

## 3. Stack y por qué

| Pieza | Versión | Por qué / advertencias |
|---|---|---|
| Astro | `^6.4.8` (**no subir a 7**) | SSG puro = Core Web Vitals perfectos. Astro 7 salió hace semanas, sin probar compatibilidad |
| Tailwind CSS | `~4.1.8` (**no subir a 4.3+**) | El spec original documentó que 4.3+ rompe con Astro 6. Tokens vía `@theme` en CSS |
| `@astrojs/vercel` | `^10` | v10 = Astro 6, v11 = Astro 7. Materializa los redirects en `.vercel/output/config.json` |
| `@astrojs/sitemap` | ^3.7 | Sitemap automático en build (112 URLs) |
| ~~`@astrojs/partytown`~~ | eliminado 2026-07-15 | Nunca ejecutó los scripts de GA4 (ni en dev ni en Vercel); GA4 pasó a gtag async estándar |
| Resend | ^4 | Email del formulario. Único código server-side del sitio |
| sharp | ^0.34 | Optimización de imágenes a WebP (scripts, no runtime) |
| turndown | ^7.2 | HTML→Markdown en la migración del blog |
| Fuentes | @fontsource (copiadas a `public/fonts/`) | Self-hosted, `font-display: optional` + preload = sin FOUT ni CLS |

**Node**: desarrollado con Node 25; Vercel usa Node 24 (warning inofensivo en build).

## 4. Estructura del repo

```
├── CLAUDE.md                     ← reglas para sesiones con IA (leer primero)
├── README.md                     ← este archivo
├── astro.config.mjs              ← site, adapter vercel, sitemap, redirects
├── redirects.mjs                 ← redirects 301 de PÁGINAS del WP (editable a mano)
├── redirects-posts.generated.mjs ← redirects 301 de POSTS (GENERADO — no editar)
├── Plan_Maestro_pSEO_LumaCloud.docx  ← estrategia SEO completa (keywords, silos, KPIs)
├── LUMA - BrandBook.pdf          ← manual de marca (gitignored, 20MB — pedirlo a Julián)
│
├── content-source/               ← ★ CORPUS: fuente de verdad del contenido (del WP)
│   ├── posts/*.{json,md}         ← 89 posts del blog (JSON crudo + MD legible)
│   ├── pages/*.{json,md,html}    ← 42 páginas (los .html son scraping de páginas Elementor rotas)
│   ├── media.json                ← metadatos de los 828 medios del WP
│   ├── INVENTORY.md              ← mapa URL antigua → título
│   └── MEDIA-CATALOG.md          ← 818 imágenes clasificadas (heros, logos, blog…)
│
├── scripts/
│   ├── extract-wp.mjs            ← extrae TODO el WP vía REST API público (re-ejecutable)
│   ├── catalog-media.mjs         ← genera MEDIA-CATALOG.md
│   ├── wp-to-collection.mjs      ← posts del corpus → src/content/blog/ (idempotente)
│   ├── optimize-images.mjs       ← originals/selected/** → public/images/**.webp
│   ├── generate-redirects.mjs    ← regenera redirects-posts.generated.mjs
│   └── originals/                ← imágenes originales del WP (gitignored, 251MB, solo local)
│       ├── wp-media/             ← las 817 descargadas (prefijo = id del medio en WP)
│       └── selected/             ← curadas con nombre limpio → input de optimize-images
│
├── public/
│   ├── fonts/                    ← bebas-neue.woff2 + inter-variable.woff2
│   ├── images/                   ← SOLO WebP optimizado (brand/, heros/, nosotros/, blog/, og/)
│   ├── robots.txt                ← permite AI crawlers (GPTBot, ClaudeBot, etc.)
│   ├── llms.txt                  ← mapa del sitio para LLMs (formato llmstxt.org)
│   └── favicon.svg
│
└── src/
    ├── content.config.ts         ← schema Zod de la colección blog
    ├── content/blog/*.md         ← 88 artículos migrados (GENERADOS por wp-to-collection)
    ├── layouts/BaseLayout.astro  ← head SEO completo + JSON-LD + GA4 + Header/Footer
    ├── components/               ← Header, Footer, BrandImage, CTASection, FAQSection, Testimonios
    ├── lib/site.ts               ← datos de empresa centralizados (dirección, tel, redes)
    ├── lib/nav.ts                ← estructura del menú (silos + páginas)
    ├── styles/global.css         ← ★ SISTEMA DE DISEÑO (tokens @theme + utilidades)
    └── pages/                    ← 24 páginas core + blog + api/contact.ts
```

## 5. Pipeline de contenido (cómo fluye el contenido del WP a la web)

```
WordPress (lumacloud.co, REST API público)
   │  npm run extract-wp
   ▼
content-source/  (corpus: JSON + Markdown + media.json)      ← FUENTE DE VERDAD
   │  npm run wp-to-collection          │  curaduría manual → scripts/originals/selected/
   ▼                                    ▼  npm run optimize-images
src/content/blog/*.md                public/images/**.webp
   (88 posts con frontmatter Zod)      (solo WebP, con dimensiones)
```

Detalles importantes del pipeline:
- `extract-wp.mjs` maneja dos bugs del WP: el endpoint `/pages` da **error 500 en lotes** (se bajan los IDs uno a uno) y las páginas de Gonemo/LCI solo salen por **scraping del HTML público** (Elementor rompe su render en el API).
- `wp-to-collection.mjs` es **idempotente y destructivo**: regenera todos los `.md` del blog. Si editas un post a mano, o mueves la edición al corpus o asume que se perderá al re-ejecutar. Hace: HTML→MD (turndown), descarga/convierte imágenes del cuerpo a WebP local, reescribe links internos a las rutas nuevas, degrada H1 del cuerpo a H2, limpia residuos del plugin "Tabla de contenidos", clasifica categoría por heurística de título.
- El post `hhhol` (basura) está excluido; por eso son 88 y no 89.

## 6. Sistema de diseño

Definido en `src/styles/global.css` con `@theme` de Tailwind 4. **Página patrón: `src/pages/ciberseguridad/index.astro`** — toda página de servicio nueva replica su estructura (hero split + cards + detalle con imagen + enlaces de silo + FAQs + CTA).

**Colores** (escala completa en global.css):
`cold-600 #173A87` (primario/títulos) · `mid-500 #0073FF` (CTAs/acción) · `sky-500 #27CAFF` (acentos) · `ink #100E16` (texto/footer) · `frost-50..300` (superficies frías claras)

**Tipografía**: `font-display` = Bebas Neue en MAYÚSCULAS con tracking (H1/H2 display); cuerpo = Inter Variable. Ambas self-hosted con preload.

**Utilidades propias** (usarlas, no reinventar):
| Utilidad | Qué hace |
|---|---|
| `brand-rule` | línea de gradiente de marca (firma visual, bajo títulos) |
| `text-brand-gradient` | texto con gradiente cold→mid→sky |
| `bg-blueprint` / `bg-blueprint-dark` | grid técnico sutil de fondo |
| `bg-hero-mesh` | glows radiales azules para heros claros |
| `card-brand` | card blanca con hover elevado + glow azul |
| `animate-rise` (+ `.stagger` en el padre) | entrada al cargar |
| `scroll-reveal` | entrada al hacer scroll (CSS `animation-timeline: view()`, con @supports). **Patrón correcto**: `.stagger` en el contenedor + `.scroll-reveal` en CADA hijo — si solo va en el contenedor, revela como un bloque único en vez de cascada |
| `animate-marquee` | loop horizontal continuo, pausa en `:hover` (franja de vendors). Usar siempre con 2 copias del contenido, solo la 2ª con `aria-hidden="true"` |
| `animate-rise-float` | entrada (rise) + flotación continua combinadas en una sola utilidad. **No apilar** `animate-rise` + un `animate-float` separado: ambas usan el shorthand CSS `animation` y la segunda pisaría a la primera — por eso existen combinadas |
| `parallax-hero` | parallax sutil vía `animation-timeline: scroll()` nativo, envolver la imagen del hero |

**Reglas duras**: animaciones solo CSS (cero JS de animación) · solo WebP en `public/images/` · todo `<img>` con `width`/`height` · imagen LCP del hero con `fetchpriority="high"` (prop `priority` de `BrandImage`) · footer siempre oscuro (`ink`) · **todo elemento interactivo (link, botón, radio, chip) con tap target ≥44×44px** (patrón `flex min-h-11 items-center`, verificado en auditoría mobile de julio 2026).

**Componentes** (`src/components/`): `BaseLayout` (props: `title`, `description`, `ogImage?`, `breadcrumbs?`, `schemas?`, `noindex?`) · `BrandImage` (imagen con tratamiento de marca; props `overlay`, `priority`) · `StatCallout` (estadística externa citada con fuente; props `stat`, `label`, `source`, `sourceUrl` — la cifra debe estar en la lista de "Estadísticas externas citables" de `CLAUDE.md`) · `CTASection` (cierre oscuro con CTA + WhatsApp) · `FAQSection` (acordeón `<details>` que emite schema FAQPage solo) · `Testimonios` (4 clientes verificados — NO agregar testimonios sin verificar) · `Header` (sticky, mega-menú desktop + drawer `<details>` mobile) · `Footer` (oscuro, links y redes con tap target 44px).

## 7. SEO — cómo está montado

- **Arquitectura de 5 silos** (del Plan Maestro): `/ciberseguridad/*`, `/backup/*`, `/cloud/*`, `/soc` + `/cumplimiento/*`, blog + `/herramientas/*`. Cada página ataca UNA keyword del plan con su volumen/KD documentado.
- **Reglas por página**: title ≤60 chars (`Keyword | LumaCloud`) · description 120–155 · exactamente 1 H1 con la keyword · canonical self-referencing · breadcrumbs (prop + schema).
- **JSON-LD** (en BaseLayout, todas las páginas): Organization + LocalBusiness (geo Bogotá) + WebSite + BreadcrumbList. Por tipo: Service (páginas de silo), Article (blog), SoftwareApplication (herramientas), FAQPage (automático vía FAQSection), Review (testimonios), AboutPage/ContactPage.
- **Redirects 301**: 108 en total. Posts (`/{slug}` → `/blog/{slug}`) en `redirects-posts.generated.mjs` (regenerar con `node scripts/generate-redirects.mjs`); páginas viejas del WP mapeadas a mano en `redirects.mjs`. Se materializan en `.vercel/output/config.json` al hacer build — verificar ahí, no funcionan en `npm run preview`.
- **AI-SEO**: `robots.txt` permite GPTBot/ClaudeBot/PerplexityBot/CCBot; `llms.txt` en formato llmstxt.org (H1 + blockquote + secciones con links Markdown — un validador externo exige ese formato exacto).
- **Herramientas gratuitas** como imanes de links/leads (hub en `/herramientas`): evaluación de madurez NIST CSF, calculadora de costo de downtime, calculadora RTO/RPO, evaluador ISO 27001, test de phishing. JS vanilla en cliente (sin backend) — la versión conectada a IA/RAG es Fase 2.

## 8. Leads: formularios → Resend + Zoho CRM

Todos los leads del sitio pasan por `src/pages/api/contact.ts` (único endpoint server-side, `prerender = false`), que despacha **en paralelo** a dos canales (`Promise.allSettled`):

1. **Resend** → email a info@lumacloud.co (respaldo; asunto indica la fuente)
2. **Zoho CRM** → crea un Lead vía `src/lib/zoho.ts` (OAuth self-client, módulo Leads; `Lead_Source` = utm_source o "Sitio web", atribución en `Description`)

Éxito si al menos un canal funciona; el fallo del otro queda en logs de Vercel. Sin ningún canal configurado responde 503 con mensaje amigable — comportamiento esperado en dev.

**Fuentes de lead** (campo `source`): `contacto` (formulario completo: nombre*, email*, empresa, teléfono, servicio, mensaje*), y `tool-iso` / `tool-rto` / `tool-phishing` / `tool-madurez` / `tool-downtime` (componente `ToolLeadForm.astro` dentro del resultado de cada herramienta: email* + empresa, con el resultado en `tool_result`). Todos con honeypot oculto `website` (anti-spam). Las claves de `TOOL_LABELS` en `src/pages/api/contact.ts` definen los `source` válidos; una herramienta nueva requiere añadir su clave ahí y al union de `Props.tool` en `ToolLeadForm.astro`.

### Analítica GA4 (eventos)

`src/lib/analytics.ts` expone `track()` (gtag async estándar, cargado en BaseLayout) y captura atribución (UTMs, landing, referrer) en `sessionStorage`, que viaja con cada lead. Listener global en `BaseLayout` para elementos con `data-track`. Los scripts inline (`define:vars`) usan `window.lumaTrack`.

| Evento | Cuándo | Parámetros |
|---|---|---|
| `generate_lead` | Envío exitoso de cualquier formulario | `form_id`, `servicio`, `tool_score` |
| `form_error` | Envío fallido | `form_id`, `error_type` |
| `contact_click` | Clic en WhatsApp/tel/email | `method`, `location` |
| `tool_complete` | Herramienta muestra resultado | `tool`, `score` |
| `cta_click` | Clic en CTAs principales | `cta`, `page` |

En GA4 hay que marcar `generate_lead` como *key event* (paso manual en la propiedad).

## 9. Workflows comunes

**Agregar una página de servicio nueva:**
1. Buscar la keyword objetivo en `Plan_Maestro_pSEO_LumaCloud.docx` (volumen, KD, URL objetivo)
2. Copiar la estructura de `src/pages/ciberseguridad/index.astro`
3. Contenido factual desde `content-source/` (¡nada inventado!)
4. Añadirla a `src/lib/nav.ts` si va en el menú, y enlazarla desde las páginas hermanas del silo
5. `npm run build` y verificar title/description/H1
6. **Actualizar `docs/ESTADO-PROYECTO.md`** (marcarla como hecha o añadirla al inventario)

**Escribir un artículo de blog nuevo** (no migrado): crear `src/content/blog/slug.md` a mano con el frontmatter del schema (`src/content.config.ts`). No usar `wp-to-collection` para posts nuevos. Estructura recomendada del spec: definición → por qué afecta a empresas colombianas → cómo funciona → cómo protegerse → FAQs (frontmatter `faqs:` genera el schema) → CTA al silo.

**Usar una imagen nueva del archivo del WP:** buscarla en `content-source/MEDIA-CATALOG.md` → copiarla de `scripts/originals/wp-media/` a `scripts/originals/selected/<carpeta>/nombre-limpio.jpg` → `npm run optimize-images` → usar `/images/<carpeta>/nombre-limpio.webp`.

**Ver el estado del proyecto / qué falta:** [`docs/ESTADO-PROYECTO.md`](docs/ESTADO-PROYECTO.md).

## 10. Deploy y lanzamiento

- **Hosting**: Vercel (proyecto lumacloud-web). `npm run build` genera `.vercel/output/` con las funciones y los redirects.
- **Checklist de lanzamiento completo**: sección "Para lanzar" de [`docs/ESTADO-PROYECTO.md`](docs/ESTADO-PROYECTO.md) — incluye respaldo del WP ([`docs/RESPALDO-WORDPRESS.md`](docs/RESPALDO-WORDPRESS.md)), Resend, GA4, validación en preview, cutover DNS y Search Console.
- El WordPress **no se borra** tras el lanzamiento: queda como respaldo (idealmente en subdominio privado) ≥3 meses.

## 11. Índice de documentación

| Documento | Contenido |
|---|---|
| [`docs/ESTADO-PROYECTO.md`](docs/ESTADO-PROYECTO.md) | **Qué hicimos y qué falta** — el estado vivo del proyecto |
| [`CLAUDE.md`](CLAUDE.md) | Reglas operativas para sesiones con Claude/IA |
| [`docs/RESPALDO-WORDPRESS.md`](docs/RESPALDO-WORDPRESS.md) | Guía de respaldo del WP para el admin |
| [`docs/superpowers/specs/2026-05-13-lumacloud-rebuild-design.md`](docs/superpowers/specs/2026-05-13-lumacloud-rebuild-design.md) | Spec técnico original del rebuild |
| `Plan_Maestro_pSEO_LumaCloud.docx` | Estrategia SEO: diagnóstico, 5 silos, keywords con volumen/KD, roadmap 12 meses, KPIs |
| `content-source/INVENTORY.md` + `MEDIA-CATALOG.md` | Inventario del contenido y medios extraídos del WP |
