# Diseño: Analítica avanzada + integración de leads con Zoho CRM

**Fecha:** 2026-07-14 · **Estado:** aprobado por Julián (conversación 2026-07-14)

## Objetivo

1. Instrumentar GA4 con eventos y conversiones (hoy solo hay pageviews vía Partytown).
2. Que todo lead del sitio (formulario de contacto + 3 herramientas) se cree como **Lead en Zoho CRM**, con el email vía Resend como respaldo.
3. Convertir las 3 herramientas gratuitas en generadoras de leads con captura opcional de email.

## Decisiones de alcance (confirmadas con el dueño)

- **Sin banner de consentimiento**: GA4 carga directo, como hoy.
- **Sin GTM**: los eventos se implementan con un helper propio versionado en el repo.
- **Módulo Zoho: Leads** (no Contacts+Deals).
- **Sin campos custom en Zoho** en esta fase: la atribución va en `Description`.

## 1. Analítica GA4

### Arquitectura

- Se mantiene el stack actual: gtag vía Partytown en `BaseLayout.astro`, `forward: ['dataLayer.push']` ya configurado en `astro.config.mjs`.
- Nuevo `src/lib/analytics.ts` (cliente): expone `track(event, params)` que hace push al `dataLayer` en formato gtag. Los scripts de página lo importan; para elementos estáticos se usa un **listener global delegado** en `BaseLayout` que lee atributos `data-track` / `data-track-*`.
- Captura de atribución en `sessionStorage` al primer pageview de la sesión: `utm_source/medium/campaign/term/content`, `landing_page`, `referrer`. Función `getAttribution()` para adjuntarla a los leads.

### Taxonomía de eventos

| Evento | Disparo | Parámetros |
|---|---|---|
| `generate_lead` | Envío exitoso de cualquier formulario de lead | `form_id` (`contacto`, `tool-iso`, `tool-rto`, `tool-phishing`), `servicio`, `tool_score` |
| `form_error` | Envío fallido (respuesta no-ok o error de red) | `form_id`, `error_type` (`validation`/`server`/`network`) |
| `contact_click` | Clic en WhatsApp / tel / mailto (Header, Footer, contacto, CTASection) | `method` (`whatsapp`/`tel`/`email`), `location` (componente) |
| `tool_complete` | La herramienta muestra su resultado | `tool`, `score` |
| `cta_click` | Clic en CTAs principales (CTASection, heroes) | `cta_id`, `page` |

Nombres alineados con los eventos recomendados de GA4 (`generate_lead` alimenta reportes estándar). Paso manual del dueño: marcar `generate_lead` como *key event* en la propiedad GA4.

## 2. Endpoint de leads + Zoho CRM

### `/api/lead` (evolución de `/api/contact`)

- `src/pages/api/contact.ts` se generaliza: acepta el formulario de contacto y los leads de herramientas. Se mantiene la URL `/api/contact` (evita tocar nada desplegado); campos nuevos opcionales: `source` (`contacto` | `tool-iso` | `tool-rto` | `tool-phishing`), `tool_result`, `utm_*`, `landing_page`, `referrer`.
- Validación como hoy (honeypot `website`, longitudes, email regex). Para leads de herramientas los obligatorios son solo `email` (+ `source`); `mensaje` deja de ser obligatorio cuando `source` ≠ `contacto`.
- Hace **en paralelo** (`Promise.allSettled`):
  1. **Resend** → email a info@lumacloud.co (igual que hoy, asunto indica la fuente).
  2. **Zoho CRM** → `POST /crm/v8/Leads`.
- Respuesta: éxito si al menos uno de los dos canales funcionó; el fallo del otro se loguea (`console.error`, visible en logs de Vercel). Falla de cara al usuario solo si fallan ambos.
- Sin credenciales Zoho configuradas → se omite Zoho silenciosamente (comportamiento actual solo-email). Sin `RESEND_API_KEY` pero con Zoho → funciona solo-Zoho.

### Autenticación Zoho (OAuth self-client)

- Variables de entorno (Vercel + `.env` local): `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ACCOUNTS_URL` (p. ej. `https://accounts.zoho.com`), `ZOHO_API_URL` (p. ej. `https://www.zohoapis.com`).
- `src/lib/zoho.ts` (server-only): renueva el access token con el refresh token y lo cachea en scope de módulo con su expiración (los workers de Vercel reutilizan el proceso; si expira o el proceso es nuevo, se renueva). Expone `createZohoLead(lead)`.
- Scope requerido del refresh token: `ZohoCRM.modules.leads.CREATE`.

### Mapeo del Lead

| Zoho | Origen |
|---|---|
| `Last_Name` (obligatorio) | apellido del nombre completo; si no se puede partir, nombre completo. `First_Name` = resto. Tools sin nombre → `Last_Name` = parte local del email |
| `Email`, `Company`, `Phone` | campos del formulario (`Company` = "—" si vacío) |
| `Lead_Source` | `utm_source` si existe, si no "Sitio web" |
| `Description` | mensaje + bloque de contexto: servicio de interés, herramienta y resultado, UTMs, landing page, referrer, URL de envío |

## 3. Captura de leads en herramientas

En `calculadora-rto-rpo`, `evaluador-iso-27001` y `test-phishing`: al mostrarse el resultado aparece debajo un card (patrón `card-brand` v1) con formulario corto **opcional**: email (obligatorio) + empresa (opcional) + honeypot, CTA "Recibe tu diagnóstico y próximos pasos". Nunca bloquea ver el resultado.

- Envía a `/api/contact` con `source` y `tool_result` (p. ej. `"ISO 27001: 40% — brechas: política, cifrado"`).
- Éxito → mensaje de confirmación inline + evento `generate_lead`.
- Tap targets ≥44px, JS vanilla, estilos consistentes con los formularios existentes.
- Nota: el "envío del diagnóstico" lo hace el equipo manualmente al recibir el lead (no hay email transaccional al usuario en esta fase — evita plantillas nuevas y temas de spam).

## 4. Requisitos del lado de Luma

1. **Zoho (bloqueante para el CRM, no para el resto):** admin crea Self Client en api-console.zoho.com → entregar Client ID, Client Secret y grant code (scope `ZohoCRM.modules.leads.CREATE`, expira ~10 min) por canal seguro; confirmar DC (probablemente `.com`). Julián/Claude intercambia el grant code por el refresh token y configura las env vars en Vercel.
2. **GA4:** confirmar `PUBLIC_GA4_ID` en Vercel; marcar `generate_lead` como key event.
3. **Zoho interno (opcional):** reglas de asignación de leads.
4. **Resend:** `RESEND_API_KEY` sigue pendiente del checklist de lanzamiento.

## Manejo de errores y pruebas

- Zoho caído → email llega, error en logs. Resend caído → lead en Zoho, error en logs. Ambos caídos → 502 al usuario con mensaje amigable.
- Pruebas: `npm run build` limpio; prueba interactiva de los 4 formularios en preview (dev responde 503 sin API keys — verificar manejo del error y eventos GA4 en `dataLayer`); verificación de tap targets en mobile 375px; unit-level no aplica (no hay framework de tests en el repo).
- Verificación E2E con Zoho: cuando existan credenciales, un envío de prueba debe aparecer como Lead en Zoho (marcarlo y borrarlo después).

## Fuera de alcance (fase 2 posible)

- Campos custom en Zoho para reporting por campaña.
- Email transaccional al usuario con su diagnóstico.
- Banner de consentimiento / Consent Mode.
- Enhanced conversions / Google Ads.
