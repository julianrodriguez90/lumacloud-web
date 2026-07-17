import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { createZohoLead, zohoConfigured } from '@/lib/zoho';
import { SITE } from '@/lib/site';

export const prerender = false;

const DESTINATION = SITE.email;

const TOOL_LABELS: Record<string, string> = {
  'tool-iso': 'Evaluador ISO 27001',
  'tool-rto': 'Calculadora RTO/RPO',
  'tool-phishing': 'Test de phishing',
  'tool-madurez': 'Evaluador de madurez en ciberseguridad',
  'tool-downtime': 'Calculadora de costo de downtime',
};

const FORM_LABELS: Record<string, string> = {
  contacto: 'Formulario de contacto',
  lci: 'Plataforma IA LCI',
};

const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'last_utm_source',
  'last_utm_medium',
  'last_utm_campaign',
  'last_utm_term',
  'last_utm_content',
  'landing_page',
  'referrer',
  'page',
  'last_touch_page',
  'last_touch_referrer',
  'cta_id',
  'cta_text',
  'cta_destination',
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
  const source = rawSource in TOOL_LABELS || rawSource in FORM_LABELS ? rawSource : 'contacto';
  const nombre = get('nombre');
  const email = get('email');
  const empresa = get('empresa');
  const telefono = get('telefono');
  const servicio = get('servicio');
  const mensaje = get('mensaje');
  const toolResult = get('tool_result').slice(0, 500);
  const consent = get('consent');
  const consentVersion = get('consent_version').slice(0, 100);
  const consentTimestamp = get('consent_timestamp').slice(0, 100);
  const lciPlan = get('lci_plan').slice(0, 200);
  const lciModalidad = get('lci_modalidad').slice(0, 200);
  const lciRoi = get('lci_roi').slice(0, 500);
  const lciAgente = get('lci_agente').slice(0, 1000);

  if (source in FORM_LABELS && (!nombre || !mensaje)) {
    return json({ error: 'Nombre, email y mensaje son obligatorios' }, 400);
  }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: 'El email es obligatorio y debe ser válido' }, 400);
  }
  if (consent !== 'yes') {
    return json({ error: 'Debes autorizar el uso de tus datos para responder la solicitud' }, 400);
  }
  if ([nombre, email, empresa, telefono, servicio].some((v) => v.length > 200) || mensaje.length > 5000) {
    return json({ error: 'Datos inválidos' }, 400);
  }

  const attribution = ATTRIBUTION_KEYS.map((key) => [key, get(key).slice(0, 300)] as const).filter(([, value]) => value);
  const attributionRecord = Object.fromEntries(attribution);

  const contexto = [
    '— Contexto del sitio web —',
    servicio && `Servicio de interés: ${servicio}`,
    source in TOOL_LABELS && `Herramienta: ${TOOL_LABELS[source]}${toolResult ? ` — ${toolResult}` : ''}`,
    source in FORM_LABELS && source !== 'contacto' && `Formulario: ${FORM_LABELS[source]}`,
    source === 'lci' && lciPlan && `Plan consultado: ${lciPlan}`,
    source === 'lci' && lciModalidad && `Modalidad: ${lciModalidad}`,
    source === 'lci' && lciRoi && `Estimación ROI declarada: ${lciRoi}`,
    source === 'lci' && lciAgente && `Agente diseñado: ${lciAgente}`,
    `Autorización: ${consentVersion || 'web-v1'}${consentTimestamp ? ` — ${consentTimestamp}` : ''}`,
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
    source in FORM_LABELS
      ? `Nuevo lead web: ${nombre}${empresa ? ` — ${empresa}` : ''}${servicio ? ` (${servicio})` : ''}`
      : `Nuevo lead web (${TOOL_LABELS[source]}): ${email}${empresa ? ` — ${empresa}` : ''}`;

  const canales: { name: 'email' | 'zoho'; promise: Promise<unknown> }[] = [];

  if (canEmail) {
    const resend = new Resend(import.meta.env.RESEND_API_KEY);
    const internalEmail = resend.emails
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
      });

    const diagnosticEmail = source in TOOL_LABELS
      ? resend.emails
          .send({
            from: 'LumaCloud <web@lumacloud.co>',
            to: [email],
            subject: `Tu diagnóstico de ${TOOL_LABELS[source]} | LumaCloud`,
            text: [
              'Gracias por completar nuestra herramienta.',
              '',
              toolResult ? `Tu resultado: ${toolResult}` : 'Registramos tu resultado para revisión.',
              '',
              'Un especialista de LumaCloud revisará el contexto y podrá contactarte con próximos pasos en horario hábil.',
              'Este diagnóstico es orientativo y no reemplaza una evaluación técnica formal.',
              '',
              `LumaCloud · ${SITE.email} · ${SITE.phoneDisplay}`,
            ].join('\n'),
          })
          .then(({ error }) => {
            if (error) throw new Error(`Resend diagnóstico: ${JSON.stringify(error)}`);
          })
      : Promise.resolve();

    canales.push({ name: 'email', promise: Promise.all([internalEmail, diagnosticEmail]) });
  }

  if (canZoho) {
    canales.push({
      name: 'zoho',
      promise: createZohoLead({
        nombre,
        email,
        empresa,
        telefono,
        leadSource: get('utm_source') || 'Sitio web',
        description: [mensaje, contexto].filter(Boolean).join('\n\n'),
        formSource: source,
        service: servicio,
        toolResult,
        landingPage: attributionRecord.landing_page,
        lastTouchPage: attributionRecord.last_touch_page,
        ctaId: attributionRecord.cta_id,
        lciPlan,
        lciModality: lciModalidad,
      }),
    });
  }

  const resultados = await Promise.allSettled(canales.map((canal) => canal.promise));
  const fallos = resultados.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
  for (const fallo of fallos) console.error('Canal de lead falló:', fallo.reason);

  if (fallos.length === resultados.length) {
    return json({ error: 'No pudimos enviar tu mensaje, intenta de nuevo o escríbenos a ' + DESTINATION }, 502);
  }
  const emailIndex = canales.findIndex((canal) => canal.name === 'email');
  const diagnosticSent = source in TOOL_LABELS && emailIndex >= 0 && resultados[emailIndex]?.status === 'fulfilled';
  return json({ ok: true, diagnostic_sent: diagnosticSent }, 200);
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
