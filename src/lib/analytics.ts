/**
 * Helper de analítica GA4 (gtag async estándar) + captura de atribución.
 * Cliente only. Los scripts inline (define:vars) usan window.lumaTrack.
 */

type TrackParams = Record<string, string | number | undefined>;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    lumaTrack: typeof track;
  }
}

export function track(event: string, params: TrackParams = {}): void {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', event, params);
}

const ATTR_KEY = 'luma_attribution';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
type LastUtmKey = `last_${(typeof UTM_KEYS)[number]}`;

export type Attribution = Partial<Record<(typeof UTM_KEYS)[number] | LastUtmKey, string>> & {
  landing_page: string;
  referrer: string;
  last_touch_page?: string;
  last_touch_referrer?: string;
  cta_id?: string;
  cta_text?: string;
  cta_destination?: string;
};

function readAttribution(): Attribution | null {
  try {
    return JSON.parse(sessionStorage.getItem(ATTR_KEY) ?? 'null');
  } catch {
    return null;
  }
}

function writeAttribution(attr: Attribution): void {
  try {
    sessionStorage.setItem(ATTR_KEY, JSON.stringify(attr));
  } catch {
    /* sessionStorage no disponible (modo privado estricto) */
  }
}

/**
 * Conserva el primer toque y actualiza la última página de contenido de la
 * sesión. /contacto no pisa la página que originó la conversión.
 */
export function initAttribution(): void {
  try {
    const params = new URLSearchParams(location.search);
    const existing = readAttribution();
    const attr: Attribution = existing ?? {
      landing_page: location.pathname,
      referrer: document.referrer,
    };
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value && !attr[key]) attr[key] = value.slice(0, 200);
      if (value) attr[`last_${key}`] = value.slice(0, 200);
    }
    if (location.pathname !== '/contacto') {
      attr.last_touch_page = location.pathname;
      attr.last_touch_referrer = document.referrer;
    }
    writeAttribution(attr);
  } catch {
    /* sessionStorage no disponible (modo privado estricto) */
  }
}

export function getAttribution(): Attribution | null {
  return readAttribution();
}

/** Conserva el CTA que llevó al usuario a contacto o a un formulario. */
export function recordInteraction(element: HTMLElement): void {
  const attr = readAttribution() ?? {
    landing_page: location.pathname,
    referrer: document.referrer,
  };
  attr.last_touch_page = location.pathname;
  attr.last_touch_referrer = document.referrer;
  attr.cta_id = (element.dataset.trackCta || element.id || 'contacto-link').slice(0, 120);
  attr.cta_text = (element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  if (element instanceof HTMLAnchorElement) attr.cta_destination = element.href.slice(0, 300);
  writeAttribution(attr);
}

/** Adjunta la atribución + página actual a un FormData de lead. */
export function appendAttribution(fd: FormData): void {
  const attr = getAttribution();
  if (attr) {
    for (const [key, value] of Object.entries(attr)) {
      if (value) fd.append(key, value);
    }
  }
  fd.append('page', location.pathname);
  if (fd.has('consent')) {
    fd.append('consent_timestamp', new Date().toISOString());
  }
}
