# Analítica GA4 avanzada + leads a Zoho CRM — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Instrumentar GA4 con eventos/conversiones y hacer que todo lead del sitio (formulario de contacto + 3 herramientas) se cree como Lead en Zoho CRM con el email Resend como respaldo.

**Architecture:** Helper cliente `src/lib/analytics.ts` (track + atribución en sessionStorage) con listener global `data-track` en BaseLayout; endpoint `/api/contact` generalizado que despacha en paralelo a Resend y a Zoho CRM (OAuth self-client server-side vía `src/lib/zoho.ts`); componente `ToolLeadForm.astro` reutilizado en las 3 herramientas.

**Tech Stack:** Astro 6 (output static + endpoint serverless en Vercel), Tailwind 4, Partytown (gtag), Resend, Zoho CRM REST API v8.

**Spec:** `docs/superpowers/specs/2026-07-14-analitica-zoho-design.md`

## Global Constraints

- No hay framework de tests en el repo: la verificación es `npm run build` sin errores + pruebas `curl` contra el dev server (`npm run dev` en :4321) + verificación interactiva en el preview browser.
- Animaciones solo CSS; JS de herramientas vanilla; tap targets ≥44×44px en todo elemento interactivo nuevo (`flex min-h-11 items-center` en el elemento clicable).
- Datos de empresa solo desde `src/lib/site.ts`. No inventar datos factuales (regla corpus anti-alucinación).
- Tono: tuteo, español de Colombia, experto pero cercano.
- No subir versiones de Astro/Tailwind. No editar `redirects-posts.generated.mjs`.
- Los scripts `define:vars` (evaluador-iso, test-phishing) son inline: NO pueden importar módulos — usan `window.lumaTrack`. Los scripts procesados (contacto, calculadora, ToolLeadForm) importan de `@/lib/analytics`.
- Nombres de eventos GA4 exactos: `generate_lead`, `form_error`, `contact_click`, `tool_complete`, `cta_click`.
- Valores de `source`/`form_id` exactos: `contacto`, `tool-iso`, `tool-rto`, `tool-phishing`.
- Todo cambio documentado en el mismo commit o al cierre del PR (regla CLAUDE.md) — Task 8 consolida docs; no cerrar sin ella.

---

### Task 1: Helper de analítica + shim gtag + listener global

**Files:**
- Create: `src/lib/analytics.ts`
- Modify: `src/layouts/BaseLayout.astro` (head: shim gtag; body: script global)

**Interfaces:**
- Produces: `track(event: string, params?: Record<string, string | number | undefined>)`, `initAttribution()`, `getAttribution(): Attribution | null`, `appendAttribution(fd: FormData)` — importables desde `@/lib/analytics`; y `window.lumaTrack` (mismo `track`) para scripts inline.
- Convención `data-track`: `data-track="<evento>"` + `data-track-<param>="<valor>"` en cualquier elemento clicable; el listener global agrega `page: location.pathname` automáticamente.

- [ ] **Step 1: Crear `src/lib/analytics.ts`**

```ts
/**
 * Helper de analítica GA4 (gtag vía Partytown) + captura de atribución.
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
```

- [ ] **Step 2: Shim gtag en el `<head>` de BaseLayout**

En `src/layouts/BaseLayout.astro`, dentro del bloque condicional `GA4 && (...)` (líneas 131-141), agregar ANTES de los dos scripts partytown un script inline que define `dataLayer`/`gtag` en el hilo principal (Partytown reenvía los `dataLayer.push` al worker gracias a `forward: ['dataLayer.push']` ya configurado):

```astro
{
  GA4 && (
    <>
      <script is:inline>window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};</script>
      <script type="text/partytown" src={`https://www.googletagmanager.com/gtag/js?id=${GA4}`} />
      <script
        type="text/partytown"
        set:html={`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${GA4}');`}
      />
    </>
  )
}
```

- [ ] **Step 3: Script global en el `<body>` de BaseLayout**

Justo antes de `</body>` (después de `<Footer />`), agregar un script procesado (sin `is:inline`):

```astro
<script>
  import { initAttribution, track } from '@/lib/analytics';

  window.lumaTrack = track;
  initAttribution();

  document.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest?.('[data-track]') as HTMLElement | null;
    if (!el?.dataset.track) return;
    const params: Record<string, string> = { page: location.pathname };
    for (const [key, value] of Object.entries(el.dataset)) {
      if (key !== 'track' && key.startsWith('track') && value) {
        params[key.slice(5).toLowerCase()] = value;
      }
    }
    track(el.dataset.track, params);
  });
</script>
```

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: build sin errores.

- [ ] **Step 5: Verificar en dev server**

Con `npm run dev` corriendo, en el preview browser abrir `http://localhost:4321/?utm_source=prueba&utm_campaign=test` y vía `javascript_tool` ejecutar:
- `sessionStorage.getItem('luma_attribution')` → JSON con `utm_source: "prueba"`, `landing_page: "/"`.
- `typeof window.lumaTrack` → `"function"`.
- Sin `PUBLIC_GA4_ID` en `.env`, `window.gtag` no existe y `track()` no debe lanzar error: `window.lumaTrack('cta_click', {})` → `undefined` sin excepción.

- [ ] **Step 6: Commit**

```bash
git add src/lib/analytics.ts src/layouts/BaseLayout.astro
git commit -m "feat(analytics): helper track() + atribución de sesión + listener global data-track"
```

---

### Task 2: Atributos `data-track` en componentes compartidos y contacto

**Files:**
- Modify: `src/components/Header.astro` (CTAs a /contacto: líneas ~68 desktop y ~104 mobile)
- Modify: `src/components/Footer.astro` (mailto línea ~77, tel línea ~80, whatsapp línea ~86)
- Modify: `src/components/CTASection.astro` (CTA principal línea ~27, whatsapp línea ~33)
- Modify: `src/pages/contacto.astro` (tel línea ~176, mailto línea ~188, whatsapp línea ~223)

**Interfaces:**
- Consumes: convención `data-track` del Task 1.
- Produces: eventos `contact_click` (params `method`, `location`) y `cta_click` (params `cta`, y `page` automático).

- [ ] **Step 1: Agregar atributos**

Sobre cada `<a>` existente (sin tocar clases ni estructura), agregar:

`Header.astro` — ambos CTAs a `/contacto`:
```
data-track="cta_click" data-track-cta="header-contacto"
```

`Footer.astro`:
```
mailto  → data-track="contact_click" data-track-method="email" data-track-location="footer"
tel     → data-track="contact_click" data-track-method="tel" data-track-location="footer"
whatsapp→ data-track="contact_click" data-track-method="whatsapp" data-track-location="footer"
```

`CTASection.astro`:
```
CTA principal ({ctaHref}) → data-track="cta_click" data-track-cta="cta-section"
whatsapp                  → data-track="contact_click" data-track-method="whatsapp" data-track-location="cta-section"
```

`contacto.astro` (columna de canales directos):
```
tel      → data-track="contact_click" data-track-method="tel" data-track-location="contacto"
mailto   → data-track="contact_click" data-track-method="email" data-track-location="contacto"
whatsapp → data-track="contact_click" data-track-method="whatsapp" data-track-location="contacto"
```

- [ ] **Step 2: Verificar build y clics**

Run: `npm run build` → sin errores.
En el preview browser (dev server), vía `javascript_tool`: `document.querySelectorAll('[data-track]').length` en `/` y en `/contacto` → ≥3 en cada una. Hacer clic en el link de WhatsApp del footer NO debe romper la navegación (abre wa.me en pestaña nueva).

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro src/components/CTASection.astro src/pages/contacto.astro
git commit -m "feat(analytics): eventos contact_click y cta_click en Header, Footer, CTASection y contacto"
```

---

### Task 3: Cliente Zoho CRM server-side

**Files:**
- Create: `src/lib/zoho.ts`
- Modify: `.env.example` (documentar variables Zoho)

**Interfaces:**
- Produces: `zohoConfigured(): boolean` y `createZohoLead(input: ZohoLeadInput): Promise<void>` (lanza Error si Zoho responde error; resuelve silenciosamente si no hay credenciales). `ZohoLeadInput = { nombre: string; email: string; empresa?: string; telefono?: string; leadSource: string; description: string }`.
- Env vars: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ACCOUNTS_URL` (default `https://accounts.zoho.com`), `ZOHO_API_URL` (default `https://www.zohoapis.com`).

- [ ] **Step 1: Crear `src/lib/zoho.ts`**

```ts
/**
 * Cliente mínimo de Zoho CRM (server-only, usado por /api/contact).
 * Auth: OAuth self-client — el refresh token vive en env vars y el access
 * token se cachea en scope de módulo (los workers de Vercel reutilizan proceso).
 * Sin credenciales configuradas, createZohoLead() no hace nada.
 */

export interface ZohoLeadInput {
  nombre: string;
  email: string;
  empresa?: string;
  telefono?: string;
  leadSource: string;
  description: string;
}

interface ZohoConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accountsUrl: string;
  apiUrl: string;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

function getConfig(): ZohoConfig | null {
  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN } = import.meta.env;
  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) return null;
  return {
    clientId: ZOHO_CLIENT_ID,
    clientSecret: ZOHO_CLIENT_SECRET,
    refreshToken: ZOHO_REFRESH_TOKEN,
    accountsUrl: import.meta.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com',
    apiUrl: import.meta.env.ZOHO_API_URL || 'https://www.zohoapis.com',
  };
}

export function zohoConfigured(): boolean {
  return getConfig() !== null;
}

async function getAccessToken(cfg: ZohoConfig): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;
  const res = await fetch(`${cfg.accountsUrl}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      refresh_token: cfg.refreshToken,
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) {
    throw new Error(`Zoho token falló: ${res.status} ${JSON.stringify(data)}`);
  }
  // margen de 120s antes de la expiración real (Zoho da 3600s)
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (Number(data.expires_in ?? 3600) - 120) * 1000,
  };
  return cachedToken.value;
}

export async function createZohoLead(input: ZohoLeadInput): Promise<void> {
  const cfg = getConfig();
  if (!cfg) return; // sin credenciales: se omite (queda el respaldo por email)

  const token = await getAccessToken(cfg);

  // Zoho exige Last_Name: partir el nombre; sin nombre, usar la parte local del email
  const parts = input.nombre.split(/\s+/).filter(Boolean);
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : parts[0] || input.email.split('@')[0];

  const record: Record<string, string> = {
    Last_Name: lastName,
    Email: input.email,
    Company: input.empresa || '—',
    Lead_Source: input.leadSource,
    Description: input.description,
  };
  if (parts.length > 1) record.First_Name = parts[0];
  if (input.telefono) record.Phone = input.telefono;

  const res = await fetch(`${cfg.apiUrl}/crm/v8/Leads`, {
    method: 'POST',
    headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [record] }),
  });
  const data = await res.json().catch(() => null);
  const status = data?.data?.[0]?.status;
  if (!res.ok || status !== 'success') {
    throw new Error(`Zoho Leads falló: ${res.status} ${JSON.stringify(data)}`);
  }
}
```

- [ ] **Step 2: Documentar env vars en `.env.example`**

Agregar al final de `.env.example`:

```bash
# Zoho CRM (self-client OAuth) — leads del sitio → módulo Leads
# Crear Self Client en https://api-console.zoho.com con scope ZohoCRM.modules.leads.CREATE
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REFRESH_TOKEN=
# Solo si el DC de la cuenta NO es .com:
# ZOHO_ACCOUNTS_URL=https://accounts.zoho.com
# ZOHO_API_URL=https://www.zohoapis.com
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: sin errores (el módulo aún no se usa; verifica tipos y sintaxis).

- [ ] **Step 4: Commit**

```bash
git add src/lib/zoho.ts .env.example
git commit -m "feat(zoho): cliente server-side de Zoho CRM Leads con OAuth self-client"
```

---

### Task 4: Generalizar `/api/contact` (leads de contacto + herramientas → Resend ∥ Zoho)

**Files:**
- Modify: `src/pages/api/contact.ts` (reescritura completa)

**Interfaces:**
- Consumes: `createZohoLead`, `zohoConfigured` de `@/lib/zoho` (Task 3).
- Produces: `POST /api/contact` acepta FormData con: `source?` (`contacto` default | `tool-iso` | `tool-rto` | `tool-phishing`), `nombre`, `email` (siempre obligatorio), `empresa`, `telefono`, `servicio`, `mensaje` (obligatorio solo si source=contacto, igual que `nombre`), `tool_result?`, `utm_source?`, `utm_medium?`, `utm_campaign?`, `utm_term?`, `utm_content?`, `landing_page?`, `referrer?`, `page?`, honeypot `website`. Respuestas: `200 {ok:true}`, `400 {error}`, `502 {error}` (ambos canales fallaron), `503 {error}` (ningún canal configurado).

- [ ] **Step 1: Reescribir `src/pages/api/contact.ts`**

```ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { createZohoLead, zohoConfigured } from '@/lib/zoho';

export const prerender = false;

const DESTINATION = 'info@lumacloud.co';

const TOOL_LABELS: Record<string, string> = {
  'tool-iso': 'Evaluador ISO 27001',
  'tool-rto': 'Calculadora RTO/RPO',
  'tool-phishing': 'Test de phishing',
};

const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'landing_page',
  'referrer',
  'page',
] as const;

export const POST: APIRoute = async ({ request }) => {
  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return json({ error: 'Formato inválido' }, 400);
  }

  // honeypot anti-spam: campo oculto que los humanos dejan vacío
  if (data.get('website')) return json({ ok: true }, 200);

  const get = (key: string) => String(data.get(key) ?? '').trim();

  const rawSource = get('source');
  const source = rawSource in TOOL_LABELS ? rawSource : 'contacto';
  const nombre = get('nombre');
  const email = get('email');
  const empresa = get('empresa');
  const telefono = get('telefono');
  const servicio = get('servicio');
  const mensaje = get('mensaje');
  const toolResult = get('tool_result').slice(0, 500);

  if (source === 'contacto' && (!nombre || !mensaje)) {
    return json({ error: 'Nombre, email y mensaje son obligatorios' }, 400);
  }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: 'El email es obligatorio y debe ser válido' }, 400);
  }
  if ([nombre, email, empresa, telefono, servicio].some((v) => v.length > 200) || mensaje.length > 5000) {
    return json({ error: 'Datos inválidos' }, 400);
  }

  const attribution = ATTRIBUTION_KEYS.map((key) => [key, get(key).slice(0, 300)] as const).filter(([, value]) => value);

  const contexto = [
    '— Contexto del sitio web —',
    servicio && `Servicio de interés: ${servicio}`,
    source !== 'contacto' && `Herramienta: ${TOOL_LABELS[source]}${toolResult ? ` — ${toolResult}` : ''}`,
    ...attribution.map(([key, value]) => `${key}: ${value}`),
  ]
    .filter(Boolean)
    .join('\n');

  const canEmail = Boolean(import.meta.env.RESEND_API_KEY);
  const canZoho = zohoConfigured();
  if (!canEmail && !canZoho) {
    console.error('Sin RESEND_API_KEY ni credenciales Zoho configuradas');
    return json({ error: 'Servicio de contacto no disponible, escríbenos a ' + DESTINATION }, 503);
  }

  const asunto =
    source === 'contacto'
      ? `Nuevo lead web: ${nombre}${empresa ? ` — ${empresa}` : ''}${servicio ? ` (${servicio})` : ''}`
      : `Nuevo lead web (${TOOL_LABELS[source]}): ${email}${empresa ? ` — ${empresa}` : ''}`;

  const canales: Promise<unknown>[] = [];

  if (canEmail) {
    const resend = new Resend(import.meta.env.RESEND_API_KEY);
    canales.push(
      resend.emails
        .send({
          from: 'Web LumaCloud <web@lumacloud.co>',
          to: [DESTINATION],
          replyTo: email,
          subject: asunto,
          text: [
            nombre && `Nombre: ${nombre}`,
            `Email: ${email}`,
            empresa && `Empresa: ${empresa}`,
            telefono && `Teléfono: ${telefono}`,
            mensaje && `\n${mensaje}\n`,
            contexto,
          ]
            .filter(Boolean)
            .join('\n'),
        })
        .then(({ error }) => {
          if (error) throw new Error(`Resend: ${JSON.stringify(error)}`);
        }),
    );
  }

  if (canZoho) {
    canales.push(
      createZohoLead({
        nombre,
        email,
        empresa,
        telefono,
        leadSource: get('utm_source') || 'Sitio web',
        description: [mensaje, contexto].filter(Boolean).join('\n\n'),
      }),
    );
  }

  const resultados = await Promise.allSettled(canales);
  const fallos = resultados.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
  for (const fallo of fallos) console.error('Canal de lead falló:', fallo.reason);

  if (fallos.length === resultados.length) {
    return json({ error: 'No pudimos enviar tu mensaje, intenta de nuevo o escríbenos a ' + DESTINATION }, 502);
  }
  return json({ ok: true }, 200);
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

- [ ] **Step 2: Probar con curl contra el dev server**

Con `npm run dev` corriendo (sin `RESEND_API_KEY` ni Zoho en `.env`):

```bash
# 1. Sin datos → 400
curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:4321/api/contact -F x=1
# Expected: 400

# 2. Honeypot lleno → 200 ok (silencioso)
curl -s -X POST http://localhost:4321/api/contact -F website=spam -F email=a@b.co
# Expected: {"ok":true}

# 3. Contacto válido sin canales configurados → 503
curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:4321/api/contact \
  -F nombre="Prueba QA" -F email=qa@test.co -F mensaje="hola"
# Expected: 503

# 4. Lead de herramienta sin email → 400
curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:4321/api/contact \
  -F source=tool-iso -F tool_result="Score: 40%"
# Expected: 400

# 5. Lead de herramienta válido sin canales → 503 (no exige nombre/mensaje)
curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:4321/api/contact \
  -F source=tool-iso -F email=qa@test.co -F tool_result="Score: 40%"
# Expected: 503
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/contact.ts
git commit -m "feat(leads): /api/contact despacha a Resend y Zoho CRM en paralelo, acepta leads de herramientas"
```

---

### Task 5: Formulario de contacto — atribución + eventos GA4

**Files:**
- Modify: `src/pages/contacto.astro` (solo el `<script>` final, líneas ~272-320)

**Interfaces:**
- Consumes: `track`, `appendAttribution` de `@/lib/analytics`; `/api/contact` (Task 4).
- Produces: eventos `generate_lead {form_id:'contacto', servicio}` y `form_error {form_id:'contacto', error_type}`.

- [ ] **Step 1: Modificar el script del formulario**

En el `<script>` de `contacto.astro`: importar el helper al inicio y ajustar el handler de submit. El script queda así (reemplaza el actual completo):

```ts
import { track, appendAttribution } from '@/lib/analytics';

const form = document.getElementById('form-contacto') as HTMLFormElement | null;
const status = document.getElementById('form-status');
const submitBtn = document.getElementById('form-submit') as HTMLButtonElement | null;

const OK_CLASSES = ['border', 'border-mid-300', 'bg-mid-500/10', 'text-cold-600'];
const ERR_CLASSES = ['border', 'border-red-300', 'bg-red-50', 'text-red-700'];

function showStatus(message: string, ok: boolean) {
  if (!status) return;
  status.classList.remove('hidden', ...OK_CLASSES, ...ERR_CLASSES);
  status.classList.add(...(ok ? OK_CLASSES : ERR_CLASSES));
  status.textContent = message;
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';
  }

  const body = new FormData(form);
  appendAttribution(body);
  const servicio = String(body.get('servicio') ?? '');

  try {
    const res = await fetch('/api/contact', { method: 'POST', body });
    let data: { ok?: boolean; error?: string } = {};
    try {
      data = await res.json();
    } catch {
      /* respuesta sin JSON */
    }

    if (res.ok && data.ok) {
      form.reset();
      showStatus('¡Mensaje enviado! Te contactaremos muy pronto en horario hábil.', true);
      track('generate_lead', { form_id: 'contacto', servicio });
    } else {
      showStatus(data.error ?? 'No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos a info@lumacloud.co.', false);
      track('form_error', { form_id: 'contacto', error_type: res.status >= 500 ? 'server' : 'validation' });
    }
  } catch {
    showStatus('Error de conexión. Verifica tu red e intenta de nuevo, o escríbenos a info@lumacloud.co.', false);
    track('form_error', { form_id: 'contacto', error_type: 'network' });
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar mensaje';
    }
  }
});
```

- [ ] **Step 2: Verificar interactivamente**

`npm run build` sin errores. En el preview browser (dev), llenar y enviar el formulario de `/contacto`: debe mostrar el error 503 amigable (sin API keys) y vía `read_network_requests` verificar que el POST incluye `landing_page`, `referrer` y `page` en el body.

- [ ] **Step 3: Commit**

```bash
git add src/pages/contacto.astro
git commit -m "feat(analytics): formulario de contacto envía atribución y dispara generate_lead/form_error"
```

---

### Task 6: Componente `ToolLeadForm` + integración en evaluador ISO 27001

**Files:**
- Create: `src/components/ToolLeadForm.astro`
- Modify: `src/pages/herramientas/evaluador-iso-27001.astro` (import, render en `#iso-resultado`, script)

**Interfaces:**
- Consumes: `/api/contact` (Task 4), `track`/`appendAttribution` (Task 1), `window.lumaTrack` (Task 1).
- Produces: componente `<ToolLeadForm tool="tool-iso" />` — root `id="tool-lead"` con `data-source`; los scripts de herramienta le ponen `document.getElementById('tool-lead')!.dataset.result = '<resumen>'` al mostrar el resultado. Eventos `generate_lead {form_id:<tool>, tool_score?}` y `form_error`.

- [ ] **Step 1: Crear `src/components/ToolLeadForm.astro`**

```astro
---
/**
 * Captura opcional de lead al final de una herramienta gratuita.
 * Colocarlo DENTRO del contenedor de resultado (que ya está hidden hasta calcular).
 * El script de la herramienta debe setear dataset.result al mostrar el resultado.
 */
interface Props {
  tool: 'tool-iso' | 'tool-rto' | 'tool-phishing';
}
const { tool } = Astro.props;
---

<div id="tool-lead" data-source={tool} class="mt-8 rounded-2xl border border-mid-200 bg-white p-6 text-left">
  <p class="font-bold text-ink">Recibe tu diagnóstico y próximos pasos</p>
  <p class="mt-1 text-sm leading-relaxed text-ink-mute">
    Déjanos tu email y un experto te envía recomendaciones concretas según tu resultado. Sin spam ni llamadas insistentes.
  </p>
  <form id="tool-lead-form" class="mt-4 grid gap-3 sm:grid-cols-[1.2fr_1fr_auto]" novalidate>
    <div class="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
      <label for="tl-website">No llenes este campo</label>
      <input type="text" id="tl-website" name="website" tabindex="-1" autocomplete="off" />
    </div>
    <div>
      <label for="tl-email" class="sr-only">Email corporativo</label>
      <input
        type="email"
        id="tl-email"
        name="email"
        required
        maxlength="200"
        autocomplete="email"
        placeholder="Email corporativo *"
        class="min-h-11 w-full rounded-xl border border-frost-300 bg-white px-4 py-2.5 text-sm text-ink transition-colors focus:border-mid-400 focus:outline-none focus:ring-2 focus:ring-mid-500/20"
      />
    </div>
    <div>
      <label for="tl-empresa" class="sr-only">Empresa</label>
      <input
        type="text"
        id="tl-empresa"
        name="empresa"
        maxlength="200"
        autocomplete="organization"
        placeholder="Empresa (opcional)"
        class="min-h-11 w-full rounded-xl border border-frost-300 bg-white px-4 py-2.5 text-sm text-ink transition-colors focus:border-mid-400 focus:outline-none focus:ring-2 focus:ring-mid-500/20"
      />
    </div>
    <button
      type="submit"
      id="tool-lead-submit"
      class="min-h-11 rounded-xl bg-mid-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-mid-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      Recibir diagnóstico
    </button>
  </form>
  <p id="tool-lead-status" role="status" aria-live="polite" class="mt-3 hidden text-sm font-medium"></p>
</div>

<script>
  import { track, appendAttribution } from '@/lib/analytics';

  const root = document.getElementById('tool-lead');
  const form = document.getElementById('tool-lead-form') as HTMLFormElement | null;
  const statusEl = document.getElementById('tool-lead-status');
  const submitBtn = document.getElementById('tool-lead-submit') as HTMLButtonElement | null;

  function showStatus(message: string, ok: boolean) {
    if (!statusEl) return;
    statusEl.classList.remove('hidden', 'text-cold-600', 'text-red-700');
    statusEl.classList.add(ok ? 'text-cold-600' : 'text-red-700');
    statusEl.textContent = message;
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity() || !root) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';
    }

    const body = new FormData(form);
    body.append('source', root.dataset.source ?? '');
    body.append('tool_result', root.dataset.result ?? '');
    appendAttribution(body);

    const formId = root.dataset.source ?? 'tool';
    try {
      const res = await fetch('/api/contact', { method: 'POST', body });
      let data: { ok?: boolean; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        /* respuesta sin JSON */
      }
      if (res.ok && data.ok) {
        form.reset();
        showStatus('¡Listo! Te enviaremos tu diagnóstico en horario hábil.', true);
        track('generate_lead', { form_id: formId, tool_score: root.dataset.result });
      } else {
        showStatus(data.error ?? 'No pudimos registrar tu email. Escríbenos a info@lumacloud.co.', false);
        track('form_error', { form_id: formId, error_type: res.status >= 500 ? 'server' : 'validation' });
      }
    } catch {
      showStatus('Error de conexión. Intenta de nuevo o escríbenos a info@lumacloud.co.', false);
      track('form_error', { form_id: formId, error_type: 'network' });
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Recibir diagnóstico';
      }
    }
  });
</script>
```

- [ ] **Step 2: Integrar en `evaluador-iso-27001.astro`**

1. En el frontmatter, agregar `import ToolLeadForm from '@/components/ToolLeadForm.astro';`
2. Dentro de `#iso-resultado` (línea ~120), justo DESPUÉS de `<div id="iso-gaps" ...></div>` y antes del bloque `mt-8 rounded-2xl bg-frost-50` del CTA, insertar:
   ```astro
   <ToolLeadForm tool="tool-iso" />
   ```
3. En el `<script define:vars>` (inline, sin imports), dentro del handler de submit, después de la línea `document.getElementById('iso-resultado').classList.remove('hidden');` agregar:
   ```js
   const leadBox = document.getElementById('tool-lead');
   if (leadBox) leadBox.dataset.result = `Score: ${score}% — brechas: ${gaps.map((g) => g.id).join(', ') || 'ninguna'}`;
   window.lumaTrack?.('tool_complete', { tool: 'tool-iso', score });
   ```

- [ ] **Step 3: Verificar interactivamente**

`npm run build` sin errores. En el preview browser: completar el evaluador → aparece el resultado con el formulario de lead debajo; `document.getElementById('tool-lead').dataset.result` contiene el score; enviar email de prueba → mensaje de error 503 amigable (sin API keys en dev). Verificar tap targets: `document.getElementById('tool-lead-submit').getBoundingClientRect().height >= 44` y lo mismo para `tl-email` en viewport 375px.

- [ ] **Step 4: Commit**

```bash
git add src/components/ToolLeadForm.astro src/pages/herramientas/evaluador-iso-27001.astro
git commit -m "feat(leads): captura de lead en evaluador ISO 27001 con componente ToolLeadForm"
```

---

### Task 7: Integrar ToolLeadForm en calculadora RTO/RPO y test de phishing

**Files:**
- Modify: `src/pages/herramientas/calculadora-rto-rpo.astro`
- Modify: `src/pages/herramientas/test-phishing.astro`

**Interfaces:**
- Consumes: `<ToolLeadForm>` (Task 6), `window.lumaTrack` / `track` (Task 1).

- [ ] **Step 1: Calculadora RTO/RPO**

1. Frontmatter: `import ToolLeadForm from '@/components/ToolLeadForm.astro';`
2. Dentro de `#resultado > .card-brand` (línea ~168), después de `<p id="res-nota" ...></p>` y antes del bloque CTA `mt-8 rounded-2xl bg-gradient-to-br`, insertar `<ToolLeadForm tool="tool-rto" />`.
3. En el `<script>` (procesado TS — puede importar), agregar al inicio `import { track } from '@/lib/analytics';` y dentro del handler de submit, después de asignar `resRto.textContent`, agregar:
   ```ts
   const leadBox = document.getElementById('tool-lead');
   if (leadBox) leadBox.dataset.result = `Estrategia: ${est.titulo} | RPO deseado: ${rpoDeseado}h, RTO deseado: ${rtoDeseado}h`;
   track('tool_complete', { tool: 'tool-rto', score: clave });
   ```
   (colocarlo antes del bloque de `resNota` para no enredarse con el if/else final).

- [ ] **Step 2: Test de phishing**

1. Frontmatter: `import ToolLeadForm from '@/components/ToolLeadForm.astro';`
2. Dentro de `#resultado > .card-brand` (línea ~211), después del `<a href="/contacto" ...>` final, insertar `<ToolLeadForm tool="tool-phishing" />`. Nota: el card es `text-center`; el componente ya trae `text-left`.
3. En el `<script define:vars>` (inline), en la rama `else` del handler de `q-siguiente` (cuando muestra el resultado final), después de `$('resultado').classList.remove('hidden');` agregar:
   ```js
   const leadBox = document.getElementById('tool-lead');
   if (leadBox) leadBox.dataset.result = `Aciertos: ${score}/${escenarios.length}`;
   window.lumaTrack?.('tool_complete', { tool: 'tool-phishing', score });
   ```

- [ ] **Step 3: Verificar interactivamente**

`npm run build` sin errores. En el preview browser: completar la calculadora y el test → en ambos aparece el formulario dentro del resultado con `dataset.result` poblado. Verificar en mobile 375px que inputs y botón midan ≥44px de alto.

- [ ] **Step 4: Commit**

```bash
git add src/pages/herramientas/calculadora-rto-rpo.astro src/pages/herramientas/test-phishing.astro
git commit -m "feat(leads): captura de lead en calculadora RTO/RPO y test de phishing"
```

---

### Task 8: Documentación + verificación final

**Files:**
- Modify: `README.md` (tabla de env vars: 5 variables Zoho; sección de formulario/pipeline: describir doble canal Resend+Zoho y el helper de analítica)
- Modify: `docs/ESTADO-PROYECTO.md` (registrar avance con fecha; checklist de lanzamiento: agregar ítems "credenciales Zoho self-client en Vercel" y "marcar generate_lead como key event en GA4"; actualizar fecha de última actualización)
- Modify: `CLAUDE.md` (sección Diseño/Gotchas: convención `data-track` + `window.lumaTrack` para scripts inline vs import para scripts procesados; regla: todo formulario nuevo de lead postea a `/api/contact` con `source` y dispara `generate_lead`; env vars Zoho)

**Interfaces:**
- Consumes: todo lo anterior.

- [ ] **Step 1: Actualizar los tres documentos** según lo descrito en Files (redactar en el tono existente de cada doc; en README incluir la tabla de eventos GA4 del spec).

- [ ] **Step 2: Verificación final completa**

```bash
npm run build
```
Expected: sin errores. Luego auditoría rápida sobre `dist/client/`: `grep -c "<h1" dist/client/contacto/index.html` → 1; canonical presente.

En el preview browser (dev, desktop + mobile 375px):
1. `/` → clic en CTA del header → `window.dataLayer` contiene el push de `cta_click` (verificar vía `javascript_tool`: guardar `window.dataLayer.length` antes/después, sin `PUBLIC_GA4_ID` el shim no existe — para esta prueba poner un ID dummy `G-TEST` en `.env` local y quitarlo al final).
2. `/contacto` → enviar formulario → error 503 amigable + `form_error` en dataLayer.
3. Las 3 herramientas → completar → `tool_complete` en dataLayer + formulario de lead visible con `dataset.result`.

- [ ] **Step 3: Commit final**

```bash
git add README.md docs/ESTADO-PROYECTO.md CLAUDE.md
git commit -m "docs: analítica GA4 por eventos + integración Zoho CRM (README, ESTADO-PROYECTO, CLAUDE.md)"
```

---

## Post-implementación (requiere insumos de Luma — fuera de este plan)

1. Recibir del admin de Zoho: Client ID, Client Secret y grant code (scope `ZohoCRM.modules.leads.CREATE`) → intercambiar por refresh token (`POST {accounts}/oauth/v2/token` con `grant_type=authorization_code`) → configurar las 3-5 env vars en Vercel.
2. Envío de prueba E2E en producción → verificar Lead en Zoho → borrarlo.
3. En GA4: marcar `generate_lead` como key event.
4. `RESEND_API_KEY` y `PUBLIC_GA4_ID` en Vercel (checklist de lanzamiento existente).
