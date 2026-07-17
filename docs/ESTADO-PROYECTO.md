# Estado del proyecto — rediseño lumacloud.co

**Última actualización:** 2026-07-17 · Rama: `master` (única rama del repo — `redesign/astro-rebuild` cumplió su ciclo vía PRs #2-#7 y fue borrada)
Documento interno de seguimiento (en el repo, no se publica en la web).

## 🧭 Resumen ejecutivo — si solo lees esto

El rediseño completo de lumacloud.co (WordPress → Astro) **está terminado, verificado y listo para desplegar**: 117 URLs en el sitemap, blog de 88 posts, SEO técnico completo, sistema de diseño con motion pulido, y una auditoría de usabilidad mobile ya corregida. Nada de esto está en producción todavía — el sitio vive solo en este repo (`master`) y en `localhost:4321`.

**Lo que falta para lanzar** es 100% acción del dueño (respaldo del WP, cuenta de Resend, deploy a Vercel, cutover de DNS — ver checklist abajo). **Lo que falta para ganar en SEO** es contenido: 8 artículos evergreen + ~11 subpáginas comerciales de la Fase 1 del Plan Maestro, todavía sin escribir. Ninguno de los dos frentes requiere más trabajo de diseño o arquitectura — ambos son ejecución sobre una base ya sólida.

## Objetivo

Reemplazar el WordPress actual (LCP móvil 25.9s, 88% tráfico de marca, ~19 visitas orgánicas no-marca/mes) por un sitio Astro rápido, estéticamente superior y optimizado para el **Plan Maestro pSEO** (`Plan_Maestro_pSEO_LumaCloud.docx`). Contenido 100% rastreable al corpus, BrandBook o fuentes aprobadas por el cliente — los materiales recientes del cliente prevalecen sobre el WordPress histórico.

---

## ✅ Qué hicimos (julio 2026)

### Fase 0 — Respaldo y extracción del WordPress
- [x] Corpus completo extraído vía REST API público: **89 posts, 42 páginas, 828 medios** (`content-source/`)
- [x] 817 imágenes originales descargadas (`scripts/originals/wp-media/`, solo local)
- [x] `INVENTORY.md` (mapa de URLs) y `MEDIA-CATALOG.md` (clasificación visual)
- [x] Guía de respaldo para el admin: `docs/RESPALDO-WORDPRESS.md`
- [x] Páginas Gonemo rescatadas por scraping (Elementor rompe el REST API)

### Fases 1-2 — Fundación técnica y sistema de diseño
- [x] Astro 6.4 + Tailwind 4.1 + adaptador Vercel + sitemap + Partytown (GA4) — *Partytown eliminado el 2026-07-15: nunca ejecutó los scripts; GA4 pasó a gtag async estándar*
- [x] Sistema de diseño BrandBook: azules de marca, Bebas Neue + Inter self-hosted, patrón blueprint, bento grids, cards con glow, animaciones CSS puro
- [x] Componentes: BaseLayout (SEO + JSON-LD completo), Header con mega-menú, Footer, BrandImage, CTASection, FAQSection, Testimonios
- [x] Endpoint `/api/contact` con Resend + honeypot anti-spam

### Fase 3 — Páginas core (28 URLs)
- [x] Home + quienes-somos + contacto + 404
- [x] Páginas de silos: ciberseguridad (5: hub, consultoría, auditoría, Bogotá, Medellín), backup (3), cloud (3), SOC, cumplimiento (ISO 27001 + Ley 1581), servicios profesionales, CSIRT, Gonemo y Plataforma IA LCI
- [x] 5 herramientas interactivas funcionales: calculadora RTO/RPO, evaluador ISO 27001, test de phishing, evaluación de madurez y calculadora de costo de downtime

### Fase 4 — Blog
- [x] 88 posts migrados a Content Collections (1 basura excluida) con imágenes localizadas a WebP, links internos reescritos, categorización, schema Article, relacionados y filtro por categoría

### Fase 5 — SEO técnico
- [x] Redirects 301 de posts en raíz y páginas WP antiguas; `/plataforma-ia-lci` es ahora una página propia y se retiró su redirect anterior a Gonemo
- [x] Sitemap (117 URLs), robots.txt con AI crawlers, llms.txt conforme a llmstxt.org
- [x] JSON-LD: Organization, LocalBusiness (geo Bogotá), WebSite, BreadcrumbList, Service, Article, FAQPage y SoftwareApplication. Los testimonios visibles no emiten Review autorreferencial inelegible.

### Fase 6 — Verificación
- [x] Auditoría del sitio: titles, descriptions, H1 únicos, canonical — 0 errores
- [x] Formulario y las 5 herramientas probados end-to-end en navegador
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

### Auditoría y corrección de usabilidad mobile (2026-07-11)
Auditoría sistemática a 375px de las ~24 páginas + blog + herramientas (3 agentes en paralelo, cross-validación de hallazgos). **Cero overflow horizontal y cero grids rotos en todo el sitio** — el layout base es sólido. Se corrigieron los tap targets y un bug de recorte de imagen:
- [x] Menú móvil (`Header.astro`): links de 36px sin espacio → 44px con gap real entre filas; botón hamburguesa 40×40 → 44×44
- [x] Footer (`Footer.astro`): links de servicios/empresa/contacto (~17px) → 44px; iconos sociales 36×36 → 44×44; texto de copyright 12px → 14px
- [x] `/contacto`: links de teléfono/email/herramientas gratuitas (~17-20px) → 44px — la página de mayor conversión del sitio
- [x] `/herramientas/evaluador-iso-27001`: radios "Sí/No" (el peor caso, 20px de alto) rediseñados como pills completas de 44px con estado activo visual (`has-[:checked]`)
- [x] `/blog`: chips de filtro de categoría 34px → 44px; imagen del post destacado recortaba el título horneado en la imagen por mismatch de aspect-ratio (`h-64` fijo vs imagen real 1400×788) → `aspect-video` (coincide casi exacto con la proporción real, cero recorte)
- [x] Verificado por computed style (`getBoundingClientRect`) y visualmente en navegador — todos los tap targets confirmados en ≥44px
- [ ] Pendiente menor identificado (no bloqueante): `/blog` no pagina — los ~88 posts se renderizan todos en un solo DOM; `/quienes-somos` (~12.500px) y `/csirt` (~10.300px) son las páginas más largas del sitio, sin ancla de navegación interna — evaluar si vale la pena paginar/segmentar en una iteración futura

### Analítica avanzada + leads a Zoho CRM (2026-07-14)
Spec: `docs/superpowers/specs/2026-07-14-analitica-zoho-design.md` · Plan: `docs/superpowers/plans/2026-07-14-analitica-zoho.md`
- [x] GA4 por eventos: `src/lib/analytics.ts` (track + atribución UTM/landing/referrer en sessionStorage) + listener global `data-track` en BaseLayout; eventos `generate_lead`, `form_error`, `contact_click`, `tool_complete`, `cta_click` (taxonomía en README §8)
- [x] `/api/contact` generalizado: despacha en paralelo a Resend y Zoho CRM (Lead en módulo Leads vía `src/lib/zoho.ts`, OAuth self-client); éxito si al menos un canal funciona; acepta leads de herramientas (`source`, `tool_result`)
- [x] Captura de leads en las 5 herramientas gratuitas: `ToolLeadForm.astro` (email + empresa, opcional, dentro del resultado) — cada herramienta reporta su score al CRM
- [x] Verificado: build limpio, batería curl del endpoint (400/200/503 según caso), envíos y eventos probados en navegador (desktop + mobile 375px, tap targets 44px)
- [x] **Credenciales Zoho** (2026-07-15): Self Client creado (DC `.com`), grant code intercambiado por refresh token, credenciales en `.env` local (gitignored). ⚠️ Falta copiarlas a Vercel al momento del deploy (`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` — valores en el `.env` local de Julián).
- [x] **Prueba E2E Zoho** (2026-07-15): POST real a `/api/contact` con solo Zoho configurado → 200, Lead creado en el CRM. Lead de prueba a borrar en Zoho: email `prueba-integracion@lumacloud.co`, empresa "PRUEBA INTEGRACION WEB - BORRAR".
- [ ] **Pendiente del dueño (GA4)**: marcar `generate_lead` como key event en la propiedad GA4

### Nuevas herramientas enterprise + hub (2026-07-15)
Decisión del dueño (2026-07-15): más herramientas serias/validadas para clientes grandes. Plan aprobado en conversación; asesor de migración a la nube y diagnóstico Ley 1581 quedaron para una ola futura.
- [x] **Evaluador de madurez en ciberseguridad** (`/herramientas/evaluacion-ciberseguridad`) — cierra la herramienta faltante del Silo 1 del Plan Maestro (keyword KD 10). Metodología NIST CSF 2.0: 12 preguntas × 6 funciones, score por función, brechas priorizadas con el servicio que las cierra, StatCallout ColCERT.
- [x] **Calculadora de costo de downtime** (`/herramientas/calculadora-costo-downtime`) — BIA express (ISO 22301/NIST SP 800-34) con fórmula transparente y datos 100% declarados por el usuario (sin benchmarks inventados); escenarios 4/24/72h + exposición anual opcional; interlinking con RTO/RPO y el post del impacto financiero del DRP. Herramienta extra-plan.
- [x] **Hub `/herramientas/`** con las 5 herramientas (schema CollectionPage+ItemList) + "Herramientas" en el menú principal (nav.ts) y links actualizados en Footer y /contacto — cierra el pendiente de la página índice.
- [x] Ambas herramientas capturan leads (sources `tool-madurez`, `tool-downtime`) y emiten eventos GA4; verificadas en build, curl, browser desktop + mobile 375px (tap targets 44px) y matemática validada a mano.

### Ajustes editoriales y Plataforma IA LCI (2026-07-17)
Solicitud del dueño basada en los documentos y recursos de `Página Luma/` (`Ajustes página Luma.docx`, documento/PPT de Quiénes somos, propuesta HTML de LCI e imágenes de referencia):
- [x] **Inicio**: nuevo logo azul, fondos responsive y arte principal suministrados; H1/subtítulo actualizados; industrias ajustadas a las diez verticales indicadas; vendors Google Cloud, Vicarius y Microsoft añadidos; estadística ColCERT actualizada con el texto aprobado.
- [x] **Navegación**: enlace explícito a Inicio y “Gonemo IA” reemplazado en el menú por “Plataforma IA”. La ruta histórica `/gonemo` se conserva publicada; el menú dirige a `/plataforma-ia-lci`.
- [x] **Plataforma IA LCI**: nueva landing con contenido, modalidades y precios del brief suministrado; calculadora con supuestos declarados, simulador accesible, schema SoftwareApplication, FAQs y formulario real conectado a `/api/contact` (`source=lci`, Resend + Zoho + GA4). Se descartaron el contador de escasez artificial, el éxito de formulario simulado y la animación canvas del mockup para respetar las reglas de credibilidad, analítica y animación CSS del proyecto.
- [x] **Quiénes somos**: reconstruida alrededor del propósito, misión, visión, valores ADN Luma y los cuatro frentes del ecosistema Luma 360 entregados por el dueño. Tras la aclaración de derechos del cliente, se retiró la lámina con logos y su activo público; la sección conserva el mapa regional, muestra Google Cloud/Vicarius/Microsoft como texto y presenta únicamente los 23 nombres autorizados bajo un mensaje de experiencia y confianza, sin exponer aclaraciones legales internas. Se conservan solo los testimonios verificados del sitio.
- [x] **Contacto**: H1 y subtítulo actualizados exactamente según el documento; opción comercial renombrada a Plataforma IA.
- [x] **Fuente de verdad corregida por instrucción del dueño**: los materiales entregados por el cliente prevalecen sobre el corpus histórico. Se incorporaron a `content-source/client-approved/`, se publicaron “+11 años” y “+6 países” en Quiénes somos y se actualizaron README/AGENTS. El teléfono/WhatsApp vigente no cambia únicamente porque el documento del cliente indica que el nuevo número todavía no debe aplicarse.

### Auditoría SEO + Growth y cierre de brechas medibles (2026-07-17)
- [x] Auditorías independientes SEO/Growth: la base se conserva; el pSEO masivo queda congelado hasta validar intención, evidencia local y QA humano.
- [x] Nueva `docs/SEO-MATRIZ-2026.md`: una intención por URL, conflictos resueltos, orden de contenido, gates locales/sectoriales y medición 30/60/90.
- [x] Atribución ampliada: primer toque, última página útil, referrer y CTA; fallback global para todos los enlaces a `/contacto`.
- [x] LCI transmite al lead plan, modalidad, estimación ROI y agente configurado cuando el usuario los utiliza.
- [x] Zoho admite campos personalizados opcionales vía `ZOHO_FIELD_*`; sin ellos, el contexto completo permanece en `Description`.
- [x] Formularios con autorización obligatoria, versión y timestamp; falta validación legal del aviso/política definitiva.
- [x] Las cinco herramientas envían una copia orientativa del resultado al usuario cuando Resend está activo; si solo funciona Zoho, informan que un especialista lo revisará.
- [x] Review schema autorreferencial retirado sin quitar testimonios; política editorial pública y campos futuros de autor/revisor/fuentes en Content Collections.
- [x] Blog: CTA contextual a la herramienta más cercana + servicio del silo.
- [x] `llms.txt` actualizado con LCI, cinco herramientas, `+11 años`, `+6 países` y países aprobados.
- [x] Corrección semántica de claims no respaldados como “RTO/RPO garantizados” y “datacenters certificados” en las superficies intervenidas.
- [x] QA: build limpio; 118 HTML sin errores de H1/main/title/description/canonical; 117 URLs en sitemap; 404 excluido; desktop y móvil 375px sin overflow.

---

## 🔲 Qué nos hace falta

### Para lanzar (bloqueantes — acciones del dueño)
- [ ] **Respaldo WP** con el admin (ver `docs/RESPALDO-WORDPRESS.md`): exportar WXR + UpdraftPlus
- [ ] **Resend**: crear cuenta, verificar dominio lumacloud.co, poner `RESEND_API_KEY` en Vercel
- [ ] **Privacidad**: validar legalmente el aviso/política definitiva y el texto de autorización antes del cutover (la captura técnica de consentimiento ya está implementada)
- [x] `PUBLIC_GA4_ID` en Vercel (2026-07-15, `G-4HP5K1LWCY`, Production and Preview) — falta marcar `generate_lead` como key event en GA4
- [x] **Fix GA4** (2026-07-15): al configurar el ID real se descubrió que Partytown nunca ejecutaba los scripts de GA (sin hits, sin cookies, en dev y en Vercel). Se eliminó Partytown y GA4 pasó a gtag async estándar — verificado con hits reales a `google-analytics.com/g/collect`. **Requiere redeploy en Vercel.**
- [x] **Zoho CRM**: credenciales self-client copiadas a las env vars de Vercel (2026-07-15) — aplican desde el próximo deploy
- [ ] Push + deploy a Vercel y validar en URL de preview (probar formulario real, redirects con `curl -I`)
- [ ] PageSpeed Insights sobre el preview: confirmar LCP <2.5s móvil
- [ ] **Cutover DNS** en el registrador (WP queda como respaldo, idealmente en subdominio privado)
- [ ] Google Search Console: reenviar sitemap, monitorear cobertura y 301s

### Contenido SEO — completar Fase 1 del Plan Maestro
- [ ] **8 artículos evergreen KD<20** (~3.400 búsquedas/mes; la brecha de mayor retorno — el blog migrado es noticioso, no evergreen):
  `que-es-phishing` (1.200/mes) · `tipos-ataques-ciberneticos` (890) · `ciberseguridad-colombia-2026` (380) · `ransomware-colombia` (310) · `phishing-colombia-empresas` (290) · `backup-nube-vs-local` (120) · `ciberseguridad-pymes-colombia` (120) · `plan-drp-colombia` (90)
- [ ] **~11 subpáginas comerciales** de segunda ola: `/infraestructura/data-center` (560/mes), `/infraestructura/colocation` (210), `/cloud/iaas`, `/cloud/paas`, `/backup/corporativo`, `/backup/automatizado`, `/soc/siem`, `/soc/monitoreo`, `/soc/gestion-incidentes`, `/ciberseguridad/proteccion-datos`, `/servicios/capacitacion-ciberseguridad`
- [x] Herramienta faltante del Silo 1: triager de madurez en ciberseguridad (`/herramientas/evaluacion-ciberseguridad`) — hecha 2026-07-15 (ver sección "Nuevas herramientas enterprise")
- [ ] OG images específicas por página clave (hoy todas usan `/images/og/default.webp`)

### Fase 2 del Plan Maestro (meses 5-12 — no empezar antes del lanzamiento)
- [ ] pSEO local: piloto máximo de 3 páginas por ciudad/sector, únicamente después de superar los gates de `docs/SEO-MATRIZ-2026.md`; medir 8–12 semanas antes de escalar. No generar lotes automáticos ni adoptar Supabase/RAG solo por el plan original.
- [ ] Herramientas conectadas a RAG/LLM real (hoy son JS estático — "Plan B" correcto para Fase 1)
- [ ] Link building: guest posts en medios TI colombianos, digital PR con informe propio
- [ ] Expansión LATAM (México, Perú, Ecuador)

### Mejoras menores conocidas
- [ ] Revisar/afinar manualmente la categoría de algunos posts del blog (la asignación es heurística)
- [ ] Curar más imágenes del catálogo (`content-source/MEDIA-CATALOG.md`) para dar variedad visual a subpáginas
- [ ] Paginar `/blog` (hoy ~88 posts en un solo DOM) y evaluar segmentar `/csirt`, una de las páginas más largas del sitio en mobile

## KPIs objetivo (Plan Maestro, Fase 1 al mes 4)

| Métrica | Línea base | Meta M4 |
|---|---|---|
| Tráfico orgánico no-marca/mes | 19 | 600 |
| Keywords en top 10 | ~3 | 25+ |
| URLs indexadas | ~15 | 90+ (hoy: 117 en el sitemap; sitemap no equivale a indexación) |
| Leads orgánicos/mes | ~2 | 12+ |

**Contexto de la brecha de autoridad**: lumacloud.co hoy tiene ~60 keywords indexadas vs. 200-1.200 de competidores directos (datos101.com, cloudseguro.co, hostdime.com.co). Ningún rediseño cierra esa brecha por sí solo — se cierra con los meses de contenido evergreen + backlinks de las Fases 1-2 de arriba. **No prometer posición #1 en términos genéricos ("ciberseguridad", "cloud") a corto plazo** — es una carrera de 12+ meses, no de una web nueva. Ver conversación registrada: el dueño preguntó esto explícitamente y se le dio una respuesta honesta sobre expectativas de SEO y conversión (no hay garantías sin datos reales post-lanzamiento).
