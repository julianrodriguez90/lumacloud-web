/**
 * Clasifica los medios extraídos del WP y genera content-source/MEDIA-CATALOG.md:
 * dónde se usa cada imagen (destacada / contenido de página / post), logos,
 * iconos y fotos grandes candidatas para heros del sitio nuevo.
 *
 * Uso: node scripts/catalog-media.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = path.join(ROOT, 'content-source');

const media = JSON.parse(await readFile(path.join(OUT, 'media.json'), 'utf8'));

async function loadDir(dir) {
  const files = (await readdir(path.join(OUT, dir))).filter((f) => f.endsWith('.json'));
  return Promise.all(files.map(async (f) => JSON.parse(await readFile(path.join(OUT, dir, f), 'utf8'))));
}
const posts = await loadDir('posts');
const pages = await loadDir('pages');

// HTML crudo de páginas rescatadas por scraping
const htmlFiles = (await readdir(path.join(OUT, 'pages'))).filter((f) => f.endsWith('.html'));
const scrapedHtml = {};
for (const f of htmlFiles) scrapedHtml[f.replace('.html', '')] = await readFile(path.join(OUT, 'pages', f), 'utf8');

// Índice de uso: url de imagen (sin tamaño -WxH) → lugares donde aparece
const usage = new Map();
const normalize = (url) => url.replace(/-\d+x\d+(?=\.\w+$)/, '').split('?')[0];
function addUse(url, where) {
  const key = normalize(url);
  if (!usage.has(key)) usage.set(key, new Set());
  usage.get(key).add(where);
}
for (const p of posts) {
  if (p.featured_image?.url) addUse(p.featured_image.url, `post:${p.slug} (destacada)`);
  for (const m of p.html.matchAll(/https?:\/\/lumacloud\.co\/wp-content\/uploads\/[^\s"')]+/g)) addUse(m[0], `post:${p.slug}`);
}
for (const p of pages) {
  if (p.featured_image?.url) addUse(p.featured_image.url, `page:${p.slug} (destacada)`);
  for (const m of (p.html || '').matchAll(/https?:\/\/lumacloud\.co\/wp-content\/uploads\/[^\s"')]+/g)) addUse(m[0], `page:${p.slug}`);
}
for (const [slug, html] of Object.entries(scrapedHtml)) {
  for (const m of html.matchAll(/https?:\/\/lumacloud\.co\/wp-content\/uploads\/[^\s"')\\]+?\.(?:png|jpe?g|webp|svg|gif)/gi)) addUse(m[0], `page:${slug}`);
}

const rows = media
  .filter((m) => m.mime_type?.startsWith('image/'))
  .map((m) => {
    const w = m.media_details?.width || 0;
    const h = m.media_details?.height || 0;
    const name = path.basename(new URL(m.source_url).pathname).toLowerCase();
    const uses = [...(usage.get(normalize(m.source_url)) || [])];
    let kind = 'sin-clasificar';
    if (/logo|marca|brand/.test(name)) kind = 'logo';
    else if (w > 0 && w < 300 && h < 300) kind = 'icono/pequeña';
    else if (/portada|banner|hero|fondo|background/.test(name) || w >= 1600) kind = 'hero/banner';
    else if (uses.some((u) => u.includes('(destacada)'))) kind = 'destacada-blog';
    else if (w >= 800) kind = 'foto/ilustración';
    return { id: m.id, file: `${m.id}-${path.basename(new URL(m.source_url).pathname)}`, url: m.source_url, alt: m.alt_text || '', w, h, kind, uses };
  });

const groups = {};
for (const r of rows) (groups[r.kind] ??= []).push(r);

const usedRows = rows.filter((r) => r.uses.length);
const md = [
  '# Catálogo de medios WordPress — lumacloud.co',
  `\nTotal imágenes: ${rows.length} · Con uso detectado en el sitio: ${usedRows.length}`,
  '\nArchivos locales en `scripts/originals/wp-media/` con prefijo `{id}-`.',
  '\n> Clasificación heurística (nombre de archivo + dimensiones + dónde se referencia).',
  '> Las candidatas para el sitio nuevo deben revisarse visualmente antes de usarse.',
  ...Object.entries(groups)
    .sort(([, a], [, b]) => b.length - a.length)
    .map(([kind, items]) => [
      `\n## ${kind} (${items.length})\n`,
      '| Archivo | Dim | Alt | Usos |',
      '|---|---|---|---|',
      ...items
        .sort((a, b) => b.uses.length - a.uses.length || b.w - a.w)
        .map((r) => `| ${r.file} | ${r.w}×${r.h} | ${r.alt.slice(0, 60)} | ${r.uses.slice(0, 3).join('; ') || '—'} |`),
    ].join('\n')),
  '\n## Huecos visuales a resolver con el usuario\n',
  '- [ ] Revisar si existen fotos reales de equipo/oficina/datacenter (no detectadas por nombre)',
  '- [ ] Logos de clientes (QuantumTys, Takami, Tecnia, All Group) — verificar en grupo "logo"',
  '- [ ] Imagen hero para silos sin foto propia (backup, cumplimiento)',
].join('\n');

await writeFile(path.join(OUT, 'MEDIA-CATALOG.md'), md);
console.log(`MEDIA-CATALOG.md: ${rows.length} imágenes en ${Object.keys(groups).length} grupos`);
for (const [k, v] of Object.entries(groups)) console.log(`  ${k}: ${v.length}`);
