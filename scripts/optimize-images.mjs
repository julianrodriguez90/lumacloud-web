/**
 * Convierte imágenes de scripts/originals/selected/ a WebP optimizado
 * en public/images/. Solo WebP llega a producción.
 *
 * Estructura: scripts/originals/selected/<subcarpeta>/<archivo> →
 *             public/images/<subcarpeta>/<archivo>.webp
 *
 * Uso: node scripts/optimize-images.mjs [--max-width=1920] [--quality=80]
 */
import sharp from 'sharp';
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = path.join(ROOT, 'scripts', 'originals', 'selected');
const DEST = path.join(ROOT, 'public', 'images');

const arg = (name, def) => {
  const found = process.argv.find((a) => a.startsWith(`--${name}=`));
  return found ? Number(found.split('=')[1]) : def;
};
const MAX_WIDTH = arg('max-width', 1920);
const QUALITY = arg('quality', 80);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(jpe?g|png|webp|gif|tiff?)$/i.test(entry.name)) yield full;
  }
}

try {
  await stat(SRC);
} catch {
  console.error(`No existe ${SRC} — crea la carpeta y copia allí las imágenes seleccionadas.`);
  process.exit(1);
}

let count = 0;
for await (const file of walk(SRC)) {
  const rel = path.relative(SRC, file);
  const out = path.join(DEST, rel.replace(/\.[^.]+$/, '.webp'));
  await mkdir(path.dirname(out), { recursive: true });
  const img = sharp(file);
  const meta = await img.metadata();
  await img
    .resize({ width: Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH), withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out);
  const { width, height } = await sharp(out).metadata();
  console.log(`${rel} → ${path.relative(ROOT, out)} (${width}×${height})`);
  count++;
}
console.log(`${count} imágenes optimizadas en public/images/`);
