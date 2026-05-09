const APP_BASE = 'https://app.lumacloud.co';
const SITE_BASE = 'https://lumacloud.co';

/**
 * Genera URL de CTA con atribución UTM completa.
 * Usado en todas las páginas pSEO y herramientas.
 */
export const ctaLink = (silo: string, tool: string, extra?: Record<string, string>): string => {
  const params = new URLSearchParams({
    utm_source:   'pseo',
    utm_medium:   'organic',
    utm_campaign: silo,
    utm_content:  tool,
    ...extra,
  });
  return `/contacto?${params.toString()}`;
};

/**
 * URL para la Edge Function de RAG en Supabase.
 */
export const ragEndpoint = (silo: string): string =>
  `${APP_BASE}/functions/v1/rag-query?silo=${silo}`;
