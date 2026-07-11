# Estado del proyecto — rediseño lumacloud.co

**Última actualización:** 2026-07-11 · Rama: `redesign/astro-rebuild`
Documento interno de seguimiento (en el repo, no se publica en la web).

## Objetivo

Reemplazar el WordPress actual (LCP móvil 25.9s, 88% tráfico de marca, ~19 visitas orgánicas no-marca/mes) por un sitio Astro rápido, estéticamente superior y optimizado para el **Plan Maestro pSEO** (`Plan_Maestro_pSEO_LumaCloud.docx`). Contenido 100% rastreable al corpus extraído del WP (`content-source/`) — cero alucinaciones.

---

## ✅ Qué hicimos (julio 2026)

### Fase 0 — Respaldo y extracción del WordPress
- [x] Corpus completo extraído vía REST API público: **89 posts, 42 páginas, 828 medios** (`content-source/`)
- [x] 817 imágenes originales descargadas (`scripts/originals/wp-media/`, solo local)
- [x] `INVENTORY.md` (mapa de URLs) y `MEDIA-CATALOG.md` (clasificación visual)
- [x] Guía de respaldo para el admin: `docs/RESPALDO-WORDPRESS.md`
- [x] Páginas Gonemo rescatadas por scraping (Elementor rompe el REST API)

### Fases 1-2 — Fundación técnica y sistema de diseño
- [x] Astro 6.4 + Tailwind 4.1 + adaptador Vercel + sitemap + Partytown (GA4)
- [x] Sistema de diseño BrandBook: azules de marca, Bebas Neue + Inter self-hosted, patrón blueprint, bento grids, cards con glow, animaciones CSS puro
- [x] Componentes: BaseLayout (SEO + JSON-LD completo), Header con mega-menú, Footer, BrandImage, CTASection, FAQSection, Testimonios
- [x] Endpoint `/api/contact` con Resend + honeypot anti-spam

### Fase 3 — Páginas core (24 URLs)
- [x] Home + quienes-somos + contacto + 404
- [x] 17 páginas de silos: ciberseguridad (5: hub, consultoría, auditoría, Bogotá, Medellín), backup (3), cloud (3), SOC, cumplimiento (ISO 27001 + Ley 1581), servicios profesionales, CSIRT, Gonemo
- [x] 3 herramientas interactivas funcionales: calculadora RTO/RPO, evaluador ISO 27001, test de phishing (6 escenarios colombianos)

### Fase 4 — Blog
- [x] 88 posts migrados a Content Collections (1 basura excluida) con imágenes localizadas a WebP, links internos reescritos, categorización, schema Article, relacionados y filtro por categoría

### Fase 5 — SEO técnico
- [x] 108 redirects 301 (89 posts en raíz → /blog/slug + páginas WP viejas)
- [x] Sitemap (112 URLs), robots.txt con AI crawlers, llms.txt conforme a llmstxt.org
- [x] JSON-LD: Organization, LocalBusiness (geo Bogotá), WebSite, BreadcrumbList, Service, Article, FAQPage, SoftwareApplication, Review

### Fase 6 — Verificación
- [x] Auditoría de 112 páginas: titles, descriptions, H1 únicos, canonical — 0 errores
- [x] Formulario y las 3 herramientas probados end-to-end en navegador
- [x] Mobile verificado · Peso de home ~320KB total

### ⚠️ Decisión de diseño (2026-07-10): rediseño v2 "Swiss-technical" DESCARTADO
Se intentó una elevación de diseño (tipografía Instrument Sans + IBM Plex Mono, hero editorial con imagen pequeña, secciones numeradas estilo mono, diagramas SVG isométricos, lista editorial plana) y **el dueño la rechazó explícitamente**: "muy plano y muy blanco", "el hero se ve feo con esa imagen pequeña", "ese diagrama de las capas se ve horrible". Se revirtió todo (commits `e5e814a` y `8b3de6c`, revert en `933f57c`).
**El diseño vigente es el v1**: hero split con imagen grande y chips flotantes, Bebas Neue + Inter, headers de sección centrados con brand-rule, cards con glow azul, bento de servicios con foto. **No reintentar la dirección v2 sin pedirlo el dueño.** Si se quiere elevar el diseño, iterar SOBRE el v1 (más color/profundidad está bien; minimalismo blanco y diagramas abstractos, no).

### Elevación de motion y credibilidad — inspirado en Delta Protect (2026-07-11)
El dueño pidió comparar el sitio con [deltaprotect.com](https://www.deltaprotect.com/co/pais/empresa-ciberseguridad-colombia) (competidor colombiano premiado en Awwwards). Hallazgo: su "wow" viene de un globo 3D WebGL con scroll-jacking — técnica pesada (el navegador de inspección se colgó varias veces al intentar hacer scroll) que reintroduciría el problema de rendimiento que este rediseño resuelve. Se optó por profundizar el sistema de motion 100% CSS existente en vez de imitar el WebGL:
- [x] Marquee CSS (`animate-marquee`) en la franja de vendors del home — loop continuo, pausa en hover, respeta reduced-motion, con copia accesible + copia decorativa
- [x] Stagger real en grids de servicios, diferenciales y testimonios (antes `.scroll-reveal` estaba en el contenedor como bloque único; ahora `.stagger` en el contenedor + `.scroll-reveal` en cada card para cascada real)
- [x] Chips flotantes del hero con entrada escalonada + flotación continua sutil (`animate-rise-float`, nueva utilidad combinada — **nota técnica**: no se puede apilar `animate-rise` + `animate-float` por separado porque ambas usan el shorthand `animation` y la segunda pisaría a la primera)
- [x] Parallax sutil de la imagen del hero al hacer scroll (`parallax-hero`, `animation-timeline: scroll()` nativo)
- [x] Nuevo componente `StatCallout.astro` (estadística citada con fuente) insertado en home (antes del CTA final) y en `/ciberseguridad` (junto a email security)
- [x] Estadística real verificada contra la fuente primaria (MinTIC/ColCERT) y documentada en `CLAUDE.md` como "Estadística externa citable"
- [x] Verificado en navegador: desktop, mobile 375px, animaciones combinadas confirmadas por computed style, cero JS nuevo, build limpio

---

## 🔲 Qué nos hace falta

### Para lanzar (bloqueantes — acciones del dueño)
- [ ] **Respaldo WP** con el admin (ver `docs/RESPALDO-WORDPRESS.md`): exportar WXR + UpdraftPlus
- [ ] **Resend**: crear cuenta, verificar dominio lumacloud.co, poner `RESEND_API_KEY` en Vercel
- [ ] `PUBLIC_GA4_ID` en Vercel (GA4 ya está cableado vía Partytown)
- [ ] Push + deploy a Vercel y validar en URL de preview (probar formulario real, redirects con `curl -I`)
- [ ] PageSpeed Insights sobre el preview: confirmar LCP <2.5s móvil
- [ ] **Cutover DNS** en el registrador (WP queda como respaldo, idealmente en subdominio privado)
- [ ] Google Search Console: reenviar sitemap, monitorear cobertura y 301s

### Contenido SEO — completar Fase 1 del Plan Maestro
- [ ] **8 artículos evergreen KD<20** (~3.400 búsquedas/mes; la brecha de mayor retorno — el blog migrado es noticioso, no evergreen):
  `que-es-phishing` (1.200/mes) · `tipos-ataques-ciberneticos` (890) · `ciberseguridad-colombia-2026` (380) · `ransomware-colombia` (310) · `phishing-colombia-empresas` (290) · `backup-nube-vs-local` (120) · `ciberseguridad-pymes-colombia` (120) · `plan-drp-colombia` (90)
- [ ] **~11 subpáginas comerciales** de segunda ola: `/infraestructura/data-center` (560/mes), `/infraestructura/colocation` (210), `/cloud/iaas`, `/cloud/paas`, `/backup/corporativo`, `/backup/automatizado`, `/soc/siem`, `/soc/monitoreo`, `/soc/gestion-incidentes`, `/ciberseguridad/proteccion-datos`, `/servicios/capacitacion-ciberseguridad`
- [ ] Herramienta faltante del Silo 1: triager de madurez en ciberseguridad (`/herramientas/evaluacion-ciberseguridad`)
- [ ] OG images específicas por página clave (hoy todas usan `/images/og/default.webp`)

### Fase 2 del Plan Maestro (meses 5-12 — no empezar antes del lanzamiento)
- [ ] pSEO local: páginas por ciudad (Cali, Barranquilla, Bucaramanga) y por sector (financiero, salud, retail, educación, manufactura) — con Supabase según el plan
- [ ] Herramientas conectadas a RAG/LLM real (hoy son JS estático — "Plan B" correcto para Fase 1)
- [ ] Link building: guest posts en medios TI colombianos, digital PR con informe propio
- [ ] Expansión LATAM (México, Perú, Ecuador)

### Mejoras menores conocidas
- [ ] Revisar/afinar manualmente la categoría de algunos posts del blog (la asignación es heurística)
- [ ] Curar más imágenes del catálogo (`content-source/MEDIA-CATALOG.md`) para dar variedad visual a subpáginas
- [ ] Página índice de `/herramientas/` (hoy solo existen las 3 herramientas sueltas)

## KPIs objetivo (Plan Maestro, Fase 1 al mes 4)

| Métrica | Línea base | Meta M4 |
|---|---|---|
| Tráfico orgánico no-marca/mes | 19 | 600 |
| Keywords en top 10 | ~3 | 25+ |
| URLs indexadas | ~15 | 90+ (hoy: 112 construidas) |
| Leads orgánicos/mes | ~2 | 12+ |
