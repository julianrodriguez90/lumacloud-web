/**
 * Convierte los posts extraídos del WP (content-source/posts/*.json) a la
 * Content Collection de Astro (src/content/blog/*.md):
 *  - HTML → Markdown (turndown)
 *  - Imagen destacada + imágenes del cuerpo → WebP local en public/images/blog/
 *  - Links internos reescritos a las rutas nuevas
 *  - Frontmatter validado por el schema Zod de content.config.ts
 *
 * Uso: node scripts/wp-to-collection.mjs
 */
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import TurndownService from 'turndown';
import sharp from 'sharp';
import { pageRedirects } from '../redirects.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = path.join(ROOT, 'content-source', 'posts');
const DEST = path.join(ROOT, 'src', 'content', 'blog');
const IMG_DEST = path.join(ROOT, 'public', 'images', 'blog');
const ORIGINALS = path.join(ROOT, 'scripts', 'originals', 'wp-media');

const EXCLUDE = new Set(['hhhol']);

const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
turndown.remove(['script', 'style']);

// Índice de originales por basename (sin id ni sufijo -WxH)
const originalsByName = new Map();
for (const f of await readdir(ORIGINALS)) {
  const base = f.replace(/^\d+-/, '');
  originalsByName.set(base.toLowerCase(), path.join(ORIGINALS, f));
  originalsByName.set(base.replace(/-\d+x\d+(?=\.\w+$)/, '').toLowerCase(), path.join(ORIGINALS, f));
}

function findOriginal(url) {
  const base = decodeURIComponent(path.basename(new URL(url).pathname)).toLowerCase();
  return originalsByName.get(base) ?? originalsByName.get(base.replace(/-\d+x\d+(?=\.\w+$)/, ''));
}

async function toWebp(originalPath, destName, maxWidth = 1400) {
  const out = path.join(IMG_DEST, destName);
  if (!existsSync(out)) {
    await mkdir(path.dirname(out), { recursive: true });
    const img = sharp(originalPath);
    const meta = await img.metadata();
    await img
      .resize({ width: Math.min(meta.width ?? maxWidth, maxWidth), withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(out);
  }
  return `/images/blog/${destName}`;
}

/** Categoría heurística — se decide por el TÍTULO (señal más fuerte) y luego el cuerpo. */
function inferCategory(title, body) {
  const t = title.toLowerCase();
  const rules = [
    ['backup', /(backup|drp|recuperaci[oó]n ante desastres|disaster recovery|continuidad del negocio)/],
    ['soc', /(\bsoc\b|cybersoc|siem|threat hunting|centro de operaciones|monitoreo)/],
    ['educacion', /(phishing|diccionario|concientizaci[oó]n|capacitaci[oó]n|deepfake|ingenier[ií]a social|estafa|vacaciones)/],
    ['ciberseguridad', /(ransomware|malware|cibercrimen|ciberataque|ciberseguridad|hacke|vulnerabilidad|amenaza|dark web|antivirus|edr|suplantaci[oó]n|fortinet|seguridad)/],
    ['cloud', /(nube|cloud|gpu|servidor|hosting|data ?center|infraestructura|\bram\b|licitaci[oó]n|agentes? (de )?ia|automatizaci[oó]n)/],
  ];
  for (const [cat, re] of rules) if (re.test(t)) return cat;
  const b = body.toLowerCase();
  for (const [cat, re] of rules) if (re.test(b)) return cat;
  return 'ciberseguridad';
}

function esc(s) {
  return String(s ?? '').replaceAll('"', "'").replace(/\s+/g, ' ').trim();
}

function clampDescription(s) {
  let d = esc(s).replace(/\[.*?\]|&hellip;|\.\.\.$/g, '').trim();
  if (d.length > 170) d = d.slice(0, 167).replace(/\s+\S*$/, '') + '…';
  if (d.length < 80) d = (d ? d + ' ' : '') + 'Análisis del equipo de LumaCloud, expertos en ciberseguridad y nube empresarial en Colombia.';
  return d.slice(0, 170);
}

// slug posts WP → /blog/slug para reescritura de links internos
const files = (await readdir(SRC)).filter((f) => f.endsWith('.json'));
const allSlugs = new Set(files.map((f) => f.replace('.json', '')));

function rewriteLink(url) {
  try {
    const u = new URL(url, 'https://lumacloud.co');
    if (!/(^|\.)lumacloud\.co$/.test(u.hostname)) return url;
    const p = u.pathname.replace(/\/$/, '') || '/';
    if (allSlugs.has(p.slice(1))) return `/blog${p}`;
    return pageRedirects[p] ?? p;
  } catch {
    return url;
  }
}

await mkdir(DEST, { recursive: true });
let ok = 0, skipped = 0, warnings = [];

for (const file of files.sort()) {
  const post = JSON.parse(await readFile(path.join(SRC, file), 'utf8'));
  if (EXCLUDE.has(post.slug) || !post.html?.trim()) {
    skipped++;
    continue;
  }

  // imagen destacada
  let image, imageAlt;
  if (post.featured_image?.url) {
    const orig = findOriginal(post.featured_image.url);
    if (orig) {
      image = await toWebp(orig, `${post.slug.slice(0, 80)}.webp`);
      imageAlt = esc(post.featured_image.alt) || esc(post.title);
    } else {
      warnings.push(`${post.slug}: imagen destacada no encontrada localmente`);
    }
  }

  // imágenes del cuerpo → locales
  let html = post.html;
  const imgUrls = [...new Set([...html.matchAll(/https?:\/\/[^\s"']*lumacloud[^\s"']*\/wp-content\/uploads\/[^\s"')]+\.(?:png|jpe?g|webp|gif)/gi)].map((m) => m[0]))];
  for (const url of imgUrls) {
    const orig = findOriginal(url);
    if (orig) {
      const name = `content/${path.basename(url).replace(/\.\w+$/, '')}.webp`.toLowerCase();
      const local = await toWebp(orig, name, 1100);
      html = html.replaceAll(url, local);
    }
  }

  let md = turndown.turndown(html);
  // links internos → rutas nuevas
  md = md.replace(/\]\((https?:\/\/(?:www\.)?lumacloud\.co[^)]*)\)/g, (_, url) => `](${rewriteLink(url)})`);
  // residuos del plugin "Tabla de contenidos" del WP (lista de anclas autorreferentes)
  md = md.replace(/Tabla de contenidos\s*\n+\[Toggle\]\(#?[^)]*\)\s*\n+(?:\*\s+\[[^\]]*\]\([^)]*\)\s*\n*)+/g, '');
  md = md.replace(/(?:\d+\.\s+)?Tabla de contenidos\s*\n+\s*\[Toggle\]\(#?[^)]*\)\s*\n*/g, '');
  // anclas internas rotas que apuntan al propio post → texto plano
  md = md.replace(/\[([^\]]+)\]\(\/blog\/[^)#]*#[^)]*\)/g, '$1');
  // el H1 lo pone la plantilla: los H1 del cuerpo bajan a H2
  md = md.replace(/^# /gm, '## ');

  const category = inferCategory(post.title, md.slice(0, 2000));
  const fm = [
    '---',
    `title: "${esc(post.title)}"`,
    `seoTitle: "${esc(post.yoast?.title || post.title).slice(0, 68)}"`,
    `seoDescription: "${clampDescription(post.yoast?.description || post.excerpt)}"`,
    `publishDate: ${post.date.slice(0, 10)}`,
    `updatedDate: ${post.modified.slice(0, 10)}`,
    `category: ${category}`,
    image ? `image: ${image}` : null,
    imageAlt ? `imageAlt: "${imageAlt.slice(0, 120)}"` : null,
    `wpUrl: ${post.link}`,
    '---',
  ].filter(Boolean).join('\n');

  await writeFile(path.join(DEST, `${post.slug}.md`), `${fm}\n\n${md}\n`);
  ok++;
}

console.log(`${ok} posts migrados, ${skipped} excluidos`);
if (warnings.length) console.warn(warnings.join('\n'));
