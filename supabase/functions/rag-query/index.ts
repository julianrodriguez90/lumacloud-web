// supabase/functions/rag-query/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SYSTEM_PROMPTS = {
  ciberseguridad: "Eres un experto en ciberseguridad para empresas colombianas. Responde basándote en el contexto proporcionado.",
  backup: "Eres un experto en backup y continuidad de negocio. Responde basándote en el contexto proporcionado.",
  cloud: "Eres un experto en infraestructura cloud y migración a la nube. Responde basándote en el contexto proporcionado.",
  soc: "Eres un experto en SOC y monitoreo de seguridad. Responde basándote en el contexto proporcionado.",
  educacion: "Eres un experto en concientización de seguridad informática. Responde basándote en el contexto proporcionado."
};

serve(async (req) => {
  const { query, silo } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Embed query con bge-m3 (Simulado aquí ya que requiere integración con OpenRouter)
  // En una implementación real, llamarías a OpenRouter API
  // const emb = await openrouter.embed(query, "bge-m3");
  const emb = new Array(1024).fill(0); // Placeholder

  // 2. Buscar chunks relevantes (threshold: 0.55)
  const { data: chunks, error } = await supabase.rpc('match_corpus', {
    query_embedding: emb,
    match_threshold: 0.55,
    filter_silo: silo,
    match_count: 5
  });

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  // 3. Generar respuesta con Claude claude-haiku-4-5-20251001
  // Simulado para este entregable técnico
  /*
  const answer = await openrouter.chat({
    model: "anthropic/claude-haiku-4-5-20251001",
    system: SYSTEM_PROMPTS[silo],
    context: chunks.map(c => c.chunk_text).join("\n---\n"),
    userQuery: query
  });
  */
  const answer = "Esta es una respuesta simulada basada en el contexto RAG de LumaCloud.";

  return new Response(
    JSON.stringify({ answer, sources: chunks }),
    { headers: { "Content-Type": "application/json" } }
  );
});
