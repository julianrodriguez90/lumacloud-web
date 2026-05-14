# LumaCloud.co — Rebuild Design Spec
**Fecha:** 2026-05-13  
**Alcance:** Reconstrucción completa desde WordPress a Astro 6 + Tailwind 4  
**Estrategia:** Plan B — 100% estático con Content Collections (Supabase/RAG en Fase 2)

---

## Contexto

LumaCloud.co es una empresa colombiana de ciberseguridad y cloud (Grupo Luma SAS, Bogotá). Su sitio actual corre en WordPress con LCP móvil de 25.9s, 88% de tráfico de marca y solo ~19 visitas orgánicas no-marca al mes. El objetivo es reconstruirlo con el stack técnico del blueprint quantumtys y la arquitectura de contenido del Plan Maestro pSEO (Mayo 2026).

**Problema que resuelve:** WordPress no permite alcanzar los Core Web Vitals necesarios para posicionar. El stack actual impide escalar el contenido SEO de forma sostenible.

**Resultado esperado:** Sitio Astro 6 estático desplegado en Vercel, Lighthouse ≥ 95, 52+ URLs indexadas, fundación técnica lista para añadir pSEO/RAG en Fase 2.

---

## 1. Stack técnico

| Pieza | Elección | Versión crítica |
|---|---|---|
| Framework | Astro 6 (`output: static`) | — |
| Estilos | Tailwind 4 vía `@tailwindcss/vite` | `^4.1.8` — NO actualizar a 4.3+ |
| Tipografía | Inter Variable self-hosted `/public/fonts/` | `font-display: optional` |
| Hosting | Vercel con `@astrojs/vercel` | — |
| Analytics | GA4 vía Partytown | cero impacto INP/LCP |
| Email | Resend en `/api/contact.ts` (`prerender = false`) | único endpoint server-side |
| Contenido | Astro Content Collections (glob loader) + Zod | blog + fichas servicio |
| Imágenes | Sharp — script `scripts/optimize-images.mjs` | solo WebP en prod |
| Sitemap | `@astrojs/sitemap` | automático en build |
| Redirects | `redirects:` en `astro.config.mjs` | NO usar vercel.json raíz |

### Dependencias package.json (punto de partida)
```json
{
  "dependencies": {
    "astro": "^6",
    "@astrojs/vercel": "latest",
    "@astrojs/sitemap": "latest",
    "@tailwindcss/vite": "^4.1.8",
    "tailwindcss": "^4.1.8",
    "sharp": "latest"
  },
  "devDependencies": {
    "@partytown/astro": "latest",
    "typescript": "^5",
    "@types/node": "^22"
  }
}
```

---

## 2. Arquitectura del proyecto

```
src/
├── layouts/BaseLayout.astro         ← head SEO, schemas JSON-LD, GA4/Partytown, font preload
├── components/
│   ├── Hero.astro                   ← fetchpriority="high" en imagen LCP
│   ├── ServiciosGrid.astro
│   ├── Testimonios.astro            ← 4 testimonios verificados del WP
│   ├── HerramientasIA.astro         ← estático Fase 1 (JS puro, sin Supabase)
│   ├── FAQSection.astro             ← genera FAQPage schema automáticamente
│   └── CTASection.astro
├── pages/
│   ├── index.astro
│   ├── quienes-somos.astro
│   ├── contacto.astro
│   ├── ciberseguridad/
│   │   ├── index.astro
│   │   ├── bogota.astro
│   │   ├── medellin.astro
│   │   ├── consultoria.astro
│   │   └── auditoria.astro
│   ├── backup/
│   │   ├── index.astro
│   │   ├── nube.astro
│   │   └── baas.astro
│   ├── cloud/
│   │   ├── index.astro
│   │   ├── privado.astro
│   │   └── migracion.astro
│   ├── soc/
│   │   └── index.astro
│   ├── cumplimiento/
│   │   ├── iso-27001.astro
│   │   └── ley-1581.astro
│   ├── servicios-profesionales.astro
│   ├── csirt.astro
│   ├── gonemo.astro
│   ├── blog/
│   │   ├── index.astro
│   │   └── [slug].astro             ← desde Content Collection
│   ├── herramientas/
│   │   ├── calculadora-rto-rpo.astro
│   │   ├── evaluador-iso-27001.astro
│   │   └── test-phishing.astro
│   ├── 404.astro
│   └── api/contact.ts               ← prerender = false
├── content/
│   ├── blog/*.md                    ← ~28 artículos (20 WP + 8 nuevos Fase 1)
│   └── servicios/*.md               ← fichas de servicio (opcional, si se separa lógica)
└── styles/global.css                ← @font-face + Tailwind @theme
public/
├── fonts/inter-variable.woff2
├── images/*.webp                    ← SOLO WebP optimizados
├── images/og/*.webp                 ← OG images (1200×630) por página
└── llms.txt
scripts/
├── optimize-images.mjs              ← conversión JPG/PNG → WebP con Sharp
└── originals/                       ← imágenes originales (nunca en prod)
```

---

## 3. URLs — inventario completo (~52 páginas)

### Estructurales
| URL | Prioridad |
|---|---|
| `/` | 🔴 Crítica |
| `/quienes-somos` | 🔴 Crítica |
| `/contacto` | 🔴 Crítica |
| `/404` | Media |

### Silos de servicio (17 páginas)
| URL | Keyword objetivo | Vol/mes |
|---|---|---|
| `/ciberseguridad` | soluciones de ciberseguridad | 480 |
| `/ciberseguridad/consultoria` | consultoría ciberseguridad colombia | 140 |
| `/ciberseguridad/bogota` | empresa de ciberseguridad bogotá | 90 |
| `/ciberseguridad/medellin` | ciberseguridad empresas medellín | ~60 |
| `/ciberseguridad/auditoria` | auditoría de seguridad informática | 350 |
| `/backup` | backup empresarial colombia | 170 |
| `/backup/nube` | solución backup en la nube | 290 |
| `/backup/baas` | backup as a service colombia | 70 |
| `/cloud` | infraestructura cloud colombia | 310 |
| `/cloud/privado` | cloud privado colombia | 240 |
| `/cloud/migracion` | migración a la nube colombia | 280 |
| `/soc` | soc as a service colombia | 60 |
| `/cumplimiento/iso-27001` | iso 27001 colombia | 250 |
| `/cumplimiento/ley-1581` | cumplimiento ley 1581 colombia | 310 |
| `/servicios-profesionales` | hacking ético, hardening, DBA | — |
| `/csirt` | csirt colombia | — |
| `/gonemo` | agentes IA empresas | — |

### Blog — Content Collection (~28 artículos)
**Migrados del WP (20):**
- `ciberseguridad-rrhh-marketing-hackeo`
- `phishing-filtracion-datos`
- `infraestructura-gpu-ia`
- `efecto-derrame-sector-salud`
- `ecommerce-ciberataque`
- `deepfakes-suplantacion-ia`
- `ransomware-sector-salud`
- `antivirus-mentira-ciberseguridad`
- `ciberseguridad-colombia-2026`
- `amenazas-ciberseguridad-2026`
- `parasito-digital-dwell-time`
- `unificar-tecnologia-luma-360`
- `diccionario-ciberseguridad-2026`
- `mentira-nube-google-drive`
- `ia-empresas-colombia-2026`
- `grinch-digital-ciberataques`
- `predicciones-ciberseguridad-2026`
- `licitaciones-ia`
- `infraestructura-black-friday`
- `paradoja-ia-ram-presupuestos-ti`

**Nuevos Fase 1 (8 — priorizados KD < 20):**
| Slug | Keyword | Vol | KD |
|---|---|---|---|
| `que-es-phishing` | qué es un ataque de phishing | 1.200 | 17 |
| `tipos-ataques-ciberneticos` | tipos de ataques cibernéticos | 890 | 20 |
| `ransomware-colombia-2025` | ransomware colombia 2025 | 310 | 11 |
| `cumplimiento-ley-1581` | cumplimiento ley 1581 colombia | 310 | 18 |
| `phishing-colombia-empresas` | phishing colombia empresas | 290 | 14 |
| `backup-nube-vs-local` | backup nube vs local empresas | 120 | 13 |
| `plan-drp-colombia` | plan drp colombia | 90 | 12 |
| `ciberseguridad-pymes-colombia` | ciberseguridad pymes colombia | 120 | 14 |

### Herramientas (3)
| URL | Implementación Fase 1 |
|---|---|
| `/herramientas/calculadora-rto-rpo` | JS puro en cliente |
| `/herramientas/evaluador-iso-27001` | quiz JS en cliente |
| `/herramientas/test-phishing` | JS puro en cliente |

---

## 4. Fundación SEO técnica

### Schemas JSON-LD en BaseLayout (todas las páginas)
```
Organization
  name: "LumaCloud" / legalName: "Grupo Luma SAS"
  url: "https://lumacloud.co"
  address: Cll 121 #15a-50, Bogotá DC, Colombia
  telephone: "+573185958261"
  email: "info@lumacloud.co"
  sameAs: [LinkedIn /company/grupolumacloud/, Instagram @luma.cloud,
           YouTube @Luma_Cloud, Facebook lumacloud113]
  knowsAbout: ["ciberseguridad empresarial", "backup empresarial",
               "cloud privado colombia", "SOC as a Service",
               "ISO 27001", "Ley 1581", "CSIRT"]

LocalBusiness
  geo: { latitude: 4.6972, longitude: -74.0455 }
  areaServed: "Colombia"
  openingHoursSpecification: lunes-viernes

WebSite + SearchAction (Sitelinks Searchbox)

BreadcrumbList — dinámico vía prop breadcrumbs[]
```

### Schemas adicionales por tipo de página
| Tipo | Schema |
|---|---|
| Blog post | `Article` (headline, datePublished, dateModified, author Person) |
| Servicio hub | `Service` (provider, areaServed Colombia, hasOfferCatalog) |
| Landing geo | `Service` con `areaServed` → ciudad específica |
| Herramienta | `SoftwareApplication` (applicationCategory: "SecurityApplication") |
| `/quienes-somos` | `AboutPage` |
| `/contacto` | `ContactPage` |

### Reglas title / meta
```
title:        ≤ 60 chars  →  "Keyword Principal | LumaCloud"
description:  120–155 chars, keyword + propuesta de valor + CTA suave
H1:           exactamente 1 por página, keyword exacta o variante cercana
canonical:    self-referencing en todas las páginas
og:image:     /images/og/[slug].webp (1200×630)
```

### robots.txt
```
User-agent: *
Allow: /
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: PerplexityBot
User-agent: Google-Extended
User-agent: CCBot
Allow: /
Sitemap: https://lumacloud.co/sitemap-index.xml
```

### llms.txt
```
# LumaCloud
> Empresa colombiana de ciberseguridad y cloud. Bogotá, Colombia.
Servicios: ciberseguridad administrada, backup empresarial, cloud privado,
SOC as a Service, consultoría ISO 27001, servicios profesionales TI, Gonemo (IA agents).
Contacto: info@lumacloud.co · +57 318 595 8261
Certificaciones: TIER III/IV, ISO, CSIRT
```

### Redirects 301 (WordPress → Astro)
Definidos en `astro.config.mjs → redirects:` — NO en vercel.json:
```
/ciberproteccion/         → /ciberseguridad
/ciber-recuperacion/      → /backup
/infraestructura-iaas/    → /cloud
/soc/                     → /soc
/quienes-somos/           → /quienes-somos
/contactenos/             → /contacto
/servicios-profesionales/ → /servicios-profesionales
/partners/                → /quienes-somos
```

---

## 5. Credibilidad E-E-A-T

### Stats globales (solo defensibles)
| Dato | Fuente verificada |
|---|---|
| Data centers certificados TIER III y IV | WP actual |
| Dirección: Cll 121 #15a-50, Bogotá DC | WP actual |
| CSIRT operativo | Página /csirt/ WP |
| ISO certificado | WP footer (sin número específico) |

**Regla:** Sin "X años de experiencia", "Y clientes", ni porcentajes de ahorro — ninguno tiene respaldo verificable en el WP actual.

### Testimonios verificados (4)
| Persona | Empresa | Cargo |
|---|---|---|
| Johnnier García | QUANTUMTYS | Director |
| David Altamar | TAKAMI | Coordinador |
| Juan Miguel Vizcaíno | Tecnia Security S.A.S | — |
| Natalia Jaimes Martinez | ALL GROUP TECHNOLOGY SAS | — |

Implementados con schema `Review` + `Person`. Nombre completo + empresa + cargo visible.

### Vendors reales por página
| Vendor | Página |
|---|---|
| Acronis Cyber Protect Cloud | `/ciberseguridad`, `/backup` |
| FortiSIEM / Fortinet | `/soc` |
| Google Gemini, Mandiant, VirusTotal | `/soc` |
| Proxmox, VMware | `/soc` |

### Frontmatter de blog (Zod schema)
```typescript
const blogSchema = z.object({
  title: z.string(),
  seoTitle: z.string().max(60),
  seoDescription: z.string().min(120).max(155),
  publishDate: z.date(),
  updatedDate: z.date(),
  author: z.string().default("Equipo LumaCloud"),
  category: z.enum(["ciberseguridad","backup","cloud","soc","educacion"]),
  silo: z.string(),
  tags: z.array(z.string()),
  image: z.string(),
  imageAlt: z.string(),
  relatedService: z.string().optional(),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
});
```

### Estructura de cada artículo de blog
```
> Disclaimer si aplica normativa (ISO, Ley 1581, etc.)
## Qué es / Definición       ← H2 con keyword exacta
## Por qué afecta a empresas colombianas
## Cómo funciona / Tipos
## Cómo protegerse / Plan de acción
## Preguntas frecuentes      ← genera FAQPage schema vía <FAQSection>
## CTA + artículos relacionados ← enlace a landing comercial del silo
```

---

## 6. Performance — reglas inamovibles

| Regla | Implementación |
|---|---|
| Solo WebP en `/public/images/` | Script Sharp — originales en `scripts/originals/` |
| `width` y `height` en todos los `<img>` | Sin excepciones — anti-CLS |
| `fetchpriority="high"` en hero | Solo imagen LCP above-the-fold |
| `font-display: optional` | En `@font-face` de Inter Variable |
| `<link rel="preload">` para fuente | En `<head>` de BaseLayout |
| GA4 en Partytown | `@partytown/astro` — cero JS en hilo principal |
| `@tailwindcss/vite ^4.1.8` fijado | La 4.3+ rompe con Astro 6 — no actualizar |
| Redirects en `astro.config.mjs` | El adaptador Vercel los inyecta en config.json |

---

## 7. Lo que se borra del repo

```
❌ src/                          ← todo (Astro 4 skeleton)
❌ scripts/generate_pseo.ts      ← Fase 2
❌ supabase/                     ← Fase 2
❌ tailwind.config.mjs           ← TW3, incompatible
❌ vercel.json                   ← reemplazado por redirects en astro.config.mjs
❌ package.json                  ← reemplazado por versiones Astro 6 + TW4
❌ .env.example                  ← nuevo (solo RESEND_API_KEY)
```

Sobreviven: `.gitignore`, `tsconfig.json` (ajustado), `README.md` (reescrito).

---

## 8. Checklist de lanzamiento

```
Build
☐ npm run build — cero errores, cero warnings
☐ Todos los titles 30–60 ch, descriptions 120–155 ch
☐ Sitemap generado con todas las URLs indexables
☐ Redirects 301 en .vercel/output/config.json

SEO
☐ Schemas JSON-LD validados en Rich Results Test
☐ robots.txt permite AI crawlers (GPTBot, ClaudeBot, etc.)
☐ llms.txt presente con descripción de empresa
☐ Canonical self-referencing en todas las páginas

Performance
☐ Solo WebP en /public/images/
☐ width/height en todos los <img>
☐ fetchpriority="high" en imagen LCP del hero
☐ Inter Variable self-hosted con font-display: optional

Contenido
☐ Testimonios con nombre completo + empresa + cargo
☐ Sin cifras sin respaldo (años, % ahorro, nº clientes)
☐ Vendors reales mencionados por silo
☐ FAQs (4–5) en cada página de servicio

Migración WP
☐ Redirects 301 para todas las rutas que cambian
☐ 20 artículos del blog migrados a Content Collection
☐ Imágenes descargadas del WP, convertidas a WebP, optimizadas
```

---

## 9. Verificación end-to-end

1. `npm run build` — sin errores
2. `npm run preview` — navegar las 52 URLs manualmente (o script de auditoría)
3. Google Rich Results Test en home + 1 blog post + 1 servicio
4. PageSpeed Insights en mobile — LCP < 2.5s, CLS = 0
5. Validar redirects: `curl -I https://lumacloud.co/ciberproteccion/` → 301
6. Verificar sitemap en `/sitemap-index.xml` — todas las URLs presentes
7. Confirmar `llms.txt` accesible en `/llms.txt`

---

## Fuentes de contenido

- **Sitio WordPress** (lumacloud.co) — scraped Mayo 2026: home, 6 páginas de servicio, contacto, quienes-somos, partners, csirt, gonemo, 20 artículos blog
- **Plan Maestro pSEO LumaCloud** (`Plan_Maestro_pSEO_LumaCloud.docx`) — keywords, URLs objetivo, estructura de silos, KPIs
- **Blueprint técnico quantumtys** — stack, performance, schemas, antipatrones
