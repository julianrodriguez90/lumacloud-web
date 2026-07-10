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
    category: z.enum(['ciberseguridad', 'backup', 'cloud', 'soc', 'educacion']),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    relatedService: z.string().optional(),
    wpUrl: z.string().optional(),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  }),
});

export const collections = { blog };
