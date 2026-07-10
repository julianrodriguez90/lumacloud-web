/**
 * Extrae todo el contenido público de lumacloud.co (WordPress) vía REST API.
 *
 * Salida:
 *   content-source/posts/*.json + *.md      — 89 artículos del blog
 *   content-source/pages/*.json + *.md      — 42 páginas
 *   content-source/media.json               — metadatos de los 834 medios
 *   content-source/INVENTORY.md             — mapa de URLs antiguas
 *   scripts/originals/wp-media/*            — archivos de imagen originales (gitignored)
 *
 * Uso: node scripts/extract-wp.mjs [--skip-media]
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';

const WP = 'https://lumacloud.co/wp-json/wp/v2';
const ROOT = new URL('..', import.meta.url).pathname;
const OUT = path.join(ROOT, 'content-source');
const MEDIA_DIR = path.join(ROOT, 'scripts', 'originals', 'wp-media');
const SKIP_MEDIA = process.argv.includes('--skip-media');

/** El API de WP a veces antepone un BOM/aviso PHP al JSON. */
async function wpFetch(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'lumacloud-migration/1.0' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const raw = await res.text();
  const start = Math.min(...['[', '{'].map((c) => raw.indexOf(c)).filter((i) => i >= 0));
  return { data: JSON.parse(raw.slice(start)), headers: res.headers };
}

async function fetchAll(type, fields = '') {
  // per_page=100 devuelve 500 en este servidor para algunos tipos; 50 es estable
  const items = [];
  let page = 1;
  while (true) {
    const url = `${WP}/${type}?per_page=50&page=${page}${fields}`;
    let result;
    try {
      result = await wpFetch(url);
    } catch (e) {
      if (String(e.message).startsWith('400')) break; // página fuera de rango
      throw e;
    }
    items.push(...result.data);
    const totalPages = Number(result.headers.get('x-wp-totalpages') || 1);
    if (page >= totalPages) break;
    page++;
  }
  return items;
}

/** Conversión HTML → Markdown básica, suficiente como corpus legible. */
function htmlToMd(html) {
  if (!html) return '';
  let s = html;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  for (let h = 6; h >= 1; h--) {
    s = s.replace(new RegExp(`<h${h}[^>]*>([\\s\\S]*?)<\\/h${h}>`, 'gi'), (_, t) => `\n\n${'#'.repeat(h)} ${strip(t)}\n\n`);
  }
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${strip(t)}`);
  s = s.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '\n![$2]($1)\n');
  s = s.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '\n![]($1)\n');
  s = s.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) => `[${strip(t)}](${href})`);
  s = s.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, '**$2**');
  s = s.replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, '*$2*');
  s = s.replace(/<\/(p|div|section|article|ul|ol|table|blockquote|figure)>/gi, '\n\n');
  s = s.replace(/<[^>]+>/g, '');
  s = decodeEntities(s);
  return s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function strip(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

function decodeEntities(s) {
  const map = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'", '&#8217;': '’', '&#8216;': '‘', '&#8220;': '“', '&#8221;': '”', '&#8211;': '–', '&#8212;': '—', '&#8230;': '…', '&nbsp;': ' ', '&iacute;': 'í', '&aacute;': 'á', '&eacute;': 'é', '&oacute;': 'ó', '&uacute;': 'ú', '&ntilde;': 'ñ', '&Aacute;': 'Á', '&Eacute;': 'É', '&Iacute;': 'Í', '&Oacute;': 'Ó', '&Uacute;': 'Ú', '&Ntilde;': 'Ñ', '&iexcl;': '¡', '&iquest;': '¿' };
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&[a-zA-Z#0-9]+;/g, (m) => map[m] ?? m);
}

async function saveContent(type, items, mediaById) {
  const dir = path.join(OUT, type);
  await mkdir(dir, { recursive: true });
  for (const item of items) {
    const slug = item.slug || `id-${item.id}`;
    const featured = mediaById.get(item.featured_media);
    const record = {
      id: item.id,
      slug,
      link: item.link,
      title: strip(item.title?.rendered || ''),
      date: item.date,
      modified: item.modified,
      excerpt: strip(item.excerpt?.rendered || ''),
      featured_image: featured ? { url: featured.source_url, alt: featured.alt_text } : null,
      yoast: item.yoast_head_json ? { title: item.yoast_head_json.title, description: item.yoast_head_json.description } : null,
      categories: item.categories,
      html: item.content?.rendered || '',
    };
    await writeFile(path.join(dir, `${slug}.json`), JSON.stringify(record, null, 2));
    const md = [
      '---',
      `title: "${record.title.replaceAll('"', "'")}"`,
      `slug: ${slug}`,
      `wp_url: ${record.link}`,
      `date: ${record.date}`,
      `modified: ${record.modified}`,
      featured ? `featured_image: ${featured.source_url}` : null,
      featured?.alt_text ? `featured_alt: "${featured.alt_text.replaceAll('"', "'")}"` : null,
      '---',
      '',
      htmlToMd(record.html),
    ].filter((l) => l !== null).join('\n');
    await writeFile(path.join(dir, `${slug}.md`), md);
  }
  console.log(`${type}: ${items.length} guardados`);
}

async function downloadMedia(media) {
  await mkdir(MEDIA_DIR, { recursive: true });
  const images = media.filter((m) => m.mime_type?.startsWith('image/'));
  console.log(`Descargando ${images.length} imágenes de ${media.length} medios...`);
  let done = 0, skipped = 0, failed = 0;
  const queue = [...images];
  async function worker() {
    while (queue.length) {
      const m = queue.shift();
      const name = `${m.id}-${path.basename(new URL(m.source_url).pathname)}`;
      const dest = path.join(MEDIA_DIR, name);
      try {
        await access(dest);
        skipped++;
        continue;
      } catch {}
      try {
        const res = await fetch(m.source_url);
        if (!res.ok) throw new Error(res.status);
        await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
        done++;
        if ((done + skipped) % 100 === 0) console.log(`  ${done + skipped}/${images.length}`);
      } catch (e) {
        failed++;
        console.warn(`  fallo: ${m.source_url} (${e.message})`);
      }
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker));
  console.log(`Imágenes: ${done} descargadas, ${skipped} ya existían, ${failed} fallidas`);
}

// --- main ---
await mkdir(OUT, { recursive: true });

console.log('Descargando metadatos de medios...');
const media = await fetchAll('media', '&_fields=id,slug,source_url,alt_text,title,mime_type,media_details,post,date');
const mediaById = new Map(media.map((m) => [m.id, m]));
await writeFile(path.join(OUT, 'media.json'), JSON.stringify(media, null, 2));
console.log(`media.json: ${media.length} items`);

/**
 * El endpoint /pages devuelve 500 al renderizar el contenido de algún registro
 * (plugin/Elementor). Se obtienen los IDs con _fields (estable) y luego cada
 * item individualmente, degradando a metadatos sin contenido si también falla.
 */
async function fetchAllResilient(type) {
  const ids = (await fetchAll(type, '&_fields=id')).map((i) => i.id);
  const items = [];
  const broken = [];
  for (const id of ids) {
    try {
      items.push((await wpFetch(`${WP}/${type}/${id}`)).data);
    } catch {
      try {
        const { data } = await wpFetch(`${WP}/${type}/${id}?_fields=id,slug,link,title,date,modified,excerpt,featured_media`);
        items.push({ ...data, content: { rendered: '' }, _content_failed: true });
        broken.push(`${id} (${data.slug}) — solo metadatos`);
      } catch {
        broken.push(`${id} — irrecuperable`);
      }
    }
  }
  if (broken.length) console.warn(`${type} con problemas:\n  ${broken.join('\n  ')}`);
  return items;
}

console.log('Descargando posts y páginas...');
const [posts, pages] = await Promise.all([fetchAllResilient('posts'), fetchAllResilient('pages')]);
await saveContent('posts', posts, mediaById);
await saveContent('pages', pages, mediaById);

// Inventario
const inv = [
  '# Inventario de contenido WordPress — lumacloud.co',
  `\nExtraído: ${new Date().toISOString().slice(0, 10)}`,
  `\n## Posts (${posts.length})\n`,
  '| URL WP | Título | Fecha |',
  '|---|---|---|',
  ...posts.map((p) => `| ${p.link} | ${strip(p.title.rendered)} | ${p.date.slice(0, 10)} |`),
  `\n## Páginas (${pages.length})\n`,
  '| URL WP | Título |',
  '|---|---|',
  ...pages.map((p) => `| ${p.link} | ${strip(p.title.rendered)} |`),
  `\n## Medios: ${media.length} items (ver media.json)\n`,
].join('\n');
await writeFile(path.join(OUT, 'INVENTORY.md'), inv);
console.log('INVENTORY.md generado');

if (!SKIP_MEDIA) await downloadMedia(media);
console.log('Extracción completa.');
