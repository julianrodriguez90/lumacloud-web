// scripts/generate_pseo.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Necesita service role para escribir
const openRouterKey = process.env.OPENROUTER_API_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const BATCH = 20;

async function generateContent(page: any) {
  // Simulación de llamada a RAG + OpenRouter
  console.log(`Generando contenido para: ${page.keyword} en ${page.ciudad || page.sector}`);

  // En una implementación real aquí se llamaría al endpoint RAG y luego a Claude
  const simulatedMarkdown = `
    <h2>Protección especializada en ${page.keyword}</h2>
    <p>La seguridad de la información es vital para el crecimiento sostenible en ${page.ciudad || page.sector}.
    Nuestras soluciones de ${page.silo} están diseñadas para mitigar riesgos específicos de la región.</p>
    <h3>Beneficios principales</h3>
    <ul>
      <li>Cumplimiento con Ley 1581</li>
      <li>Soporte técnico local 24/7</li>
      <li>Infraestructura de alta disponibilidad</li>
    </ul>
  `;

  return {
    markdown: simulatedMarkdown,
    metaTitle: `${page.keyword} en ${page.ciudad || page.sector} | LumaCloud Colombia`,
    metaDesc: `Expertos en ${page.keyword} para empresas en ${page.ciudad || page.sector}. Soluciones de ${page.silo} con soporte local.`
  };
}

async function main() {
  const { data: pages, error } = await supabase
    .from('pseo_pages')
    .select("*")
    .eq("published", false)
    .limit(BATCH);

  if (error) {
    console.error("Error fetching pages:", error);
    return;
  }

  if (!pages || pages.length === 0) {
    console.log("No hay páginas pendientes por generar.");
    return;
  }

  for (const page of pages) {
    const content = await generateContent(page);

    const { error: updateError } = await supabase
      .from('pseo_pages')
      .update({
        content_md: content.markdown,
        meta_title: content.metaTitle,
        meta_desc:  content.metaDesc,
        published:  true
      })
      .eq('id', page.id);

    if (updateError) {
      console.error(`Error actualizando página ${page.id}:`, updateError);
    } else {
      console.log(`Página ${page.id} generada y publicada.`);
    }
  }
}

main().catch(console.error);
