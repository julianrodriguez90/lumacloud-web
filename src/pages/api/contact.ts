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
