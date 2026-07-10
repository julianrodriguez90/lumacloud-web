import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const DESTINATION = 'info@lumacloud.co';

export const POST: APIRoute = async ({ request }) => {
  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return json({ error: 'Formato inválido' }, 400);
  }

  // honeypot anti-spam: campo oculto que los humanos dejan vacío
  if (data.get('website')) return json({ ok: true }, 200);

  const nombre = String(data.get('nombre') ?? '').trim();
  const email = String(data.get('email') ?? '').trim();
  const empresa = String(data.get('empresa') ?? '').trim();
  const telefono = String(data.get('telefono') ?? '').trim();
  const servicio = String(data.get('servicio') ?? '').trim();
  const mensaje = String(data.get('mensaje') ?? '').trim();

  if (!nombre || !email || !mensaje) {
    return json({ error: 'Nombre, email y mensaje son obligatorios' }, 400);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || [nombre, email, empresa, telefono, servicio].some((v) => v.length > 200) || mensaje.length > 5000) {
    return json({ error: 'Datos inválidos' }, 400);
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY no configurada');
    return json({ error: 'Servicio de contacto no disponible, escríbenos a ' + DESTINATION }, 503);
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: 'Web LumaCloud <web@lumacloud.co>',
    to: [DESTINATION],
    replyTo: email,
    subject: `Nuevo lead web: ${nombre}${empresa ? ` — ${empresa}` : ''}${servicio ? ` (${servicio})` : ''}`,
    text: [
      `Nombre: ${nombre}`,
      `Email: ${email}`,
      empresa && `Empresa: ${empresa}`,
      telefono && `Teléfono: ${telefono}`,
      servicio && `Servicio de interés: ${servicio}`,
      '',
      mensaje,
    ].filter(Boolean).join('\n'),
  });

  if (error) {
    console.error('Resend error:', error);
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
