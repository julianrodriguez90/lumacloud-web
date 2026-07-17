import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().max(70),
    seoDescription: z.string().min(80).max(170),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date(),
    author: z.string().default('Equipo LumaCloud'),
    authorUrl: z.string().optional(),
    reviewedBy: z.object({
      name: z.string(),
      role: z.string(),
      url: z.string().optional(),
    }).optional(),
    category: z.enum(['ciberseguridad', 'backup', 'cloud', 'soc', 'educacion']),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    relatedService: z.string().optional(),
    wpUrl: z.string().optional(),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    sources: z.array(z.object({ title: z.string(), url: z.string().url() })).optional(),
  }),
});

export const collections = { blog };
