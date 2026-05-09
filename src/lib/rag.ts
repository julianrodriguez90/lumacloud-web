import { ragEndpoint } from './appLinks';

/**
 * Consulta el endpoint RAG de Supabase Edge Functions.
 * Incluye rate limiting del lado cliente (localStorage).
 */
export async function queryRAG(
  query: string,
  silo: string
): Promise<{ answer: string; sources: Array<{ source_name: string; source_url: string }> }> {

  // Rate limiting cliente: 10 req/día por silo
  if (typeof localStorage !== 'undefined') {
    const key   = `rag_count_${silo}_${new Date().toDateString()}`;
    const count = parseInt(localStorage.getItem(key) ?? '0', 10);
    if (count >= 10) {
      throw new Error('Límite diario de consultas alcanzado. Intenta mañana.');
    }
    localStorage.setItem(key, String(count + 1));
  }

  const res = await fetch(ragEndpoint(silo), {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ query, silo }),
  });

  if (!res.ok) throw new Error(`RAG error: ${res.status}`);

  return res.json();
}
