import 'resend';

const prerender = false;
const DESTINATION = "info@lumacloud.co";
const POST = async ({ request }) => {
  let data;
  try {
    data = await request.formData();
  } catch {
    return json({ error: "Formato inválido" }, 400);
  }
  if (data.get("website")) return json({ ok: true }, 200);
  const nombre = String(data.get("nombre") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const empresa = String(data.get("empresa") ?? "").trim();
  const telefono = String(data.get("telefono") ?? "").trim();
  const servicio = String(data.get("servicio") ?? "").trim();
  const mensaje = String(data.get("mensaje") ?? "").trim();
  if (!nombre || !email || !mensaje) {
    return json({ error: "Nombre, email y mensaje son obligatorios" }, 400);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || [nombre, email, empresa, telefono, servicio].some((v) => v.length > 200) || mensaje.length > 5e3) {
    return json({ error: "Datos inválidos" }, 400);
  }
  {
    console.error("RESEND_API_KEY no configurada");
    return json({ error: "Servicio de contacto no disponible, escríbenos a " + DESTINATION }, 503);
  }
};
function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
