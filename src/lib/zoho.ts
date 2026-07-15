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
