/**
 * Redirects 301 WordPress → Astro.
 * El mapa de posts se genera con scripts/generate-redirects.mjs (Fase 5);
 * aquí viven los redirects estructurales de páginas.
 */

/** @type {Record<string, string>} */
export const pageRedirects = {
  '/ciberproteccion': '/ciberseguridad',
  '/ciber-recuperacion': '/backup',
  '/drp': '/backup',
  '/infraestructura-iaas': '/cloud',
  '/contactenos': '/contacto',
  '/partners': '/quienes-somos',
  '/servicios': '/#servicios',
  '/luma-360': '/',
  '/luma-cybersoc': '/soc',
  '/agente-gonemo': '/gonemo',
  '/agentes-ia-gonemo': '/gonemo',
  '/plataforma-ia-lci': '/gonemo',
  '/csirt/servicios_csirt': '/csirt',
  '/csirt/contacto_csirt': '/csirt',
  '/csirt/boletin_csirt': '/csirt',
  '/newsletter': '/blog',
  '/planes': '/contacto',
  '/tienda': '/contacto',
};

let postRedirects = {};
try {
  postRedirects = (await import('./redirects-posts.generated.mjs')).postRedirects;
} catch {
  // aún no generado — se crea en Fase 5 con scripts/generate-redirects.mjs
}

/** @type {Record<string, string>} */
export const redirects = { ...pageRedirects, ...postRedirects };
