/**
 * Genera redirects-posts.generated.mjs: 301 de cada post del WP
 * (/{slug}/ en raíz) hacia su nueva URL /blog/{slug}.
 * Las páginas excluidas del blog redirigen al índice del blog.
 *
 * Uso: node scripts/generate-redirects.mjs
 */
import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

const migrated = new Set(
  (await readdir(path.join(ROOT, 'src', 'content', 'blog'))).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
);
const allPosts = (await readdir(path.join(ROOT, 'content-source', 'posts')))
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''));

const redirects = {};
for (const slug of allPosts) {
  redirects[`/${slug}`] = migrated.has(slug) ? `/blog/${slug}` : '/blog';
}

const out = `// GENERADO por scripts/generate-redirects.mjs — no editar a mano
/** @type {Record<string, string>} */
export const postRedirects = ${JSON.stringify(redirects, null, 2)};
`;
await writeFile(path.join(ROOT, 'redirects-posts.generated.mjs'), out);
console.log(`${Object.keys(redirects).length} redirects de posts generados`);
