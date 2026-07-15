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

export type Attribution = Partial<Record<(typeof UTM_KEYS)[number], string>> & {
  landing_page: string;
  referrer: string;
};

/** Captura UTMs, landing y referrer una sola vez por sesión. */
export function initAttribution(): void {
  try {
    if (sessionStorage.getItem(ATTR_KEY)) return;
    const params = new URLSearchParams(location.search);
    const attr: Attribution = { landing_page: location.pathname, referrer: document.referrer };
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) attr[key] = value.slice(0, 200);
    }
    sessionStorage.setItem(ATTR_KEY, JSON.stringify(attr));
  } catch {
    /* sessionStorage no disponible (modo privado estricto) */
  }
}

export function getAttribution(): Attribution | null {
  try {
    return JSON.parse(sessionStorage.getItem(ATTR_KEY) ?? 'null');
  } catch {
    return null;
  }
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
}
