# LumaCloud Web — Astro + pSEO + RAG

Sitio web de LumaCloud construido con Astro SSG, Tailwind CSS y Supabase (pgvector para RAG).

## Stack

- **Frontend**: Astro 4 (SSG) + Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL + pgvector)
- **LLM**: Claude Haiku via OpenRouter
- **Deployment**: Vercel

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase y OpenRouter

# 3. Iniciar en desarrollo
npm run dev

# 4. Build para producción
npm run build
```

## Estructura

```
src/
  layouts/    → Layout base con header/footer
  pages/      → Rutas del sitio (SSG)
    ciberseguridad/
    backup/
    cloud/
    soc/
    cumplimiento/
    blog/[slug].astro    → Páginas pSEO desde Supabase
    herramientas/        → Calculadoras y tests IA
  lib/
    supabase.ts   → Cliente Supabase
    rag.ts        → Query RAG
    appLinks.ts   → UTM helpers
```

## Variables de entorno

```env
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
OPENROUTER_API_KEY=tu-openrouter-key
```

## pSEO

Ver documentación en `/scripts/generate_pseo.ts` y el Plan Maestro pSEO.
