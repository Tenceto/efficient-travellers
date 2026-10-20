import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const destinations = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/destinations' }),
  schema: z.object({
    title: z.string(),
    region: z.enum(['Asia', 'Europe', 'Latin America', 'United States', 'Africa']),
    order: z.number(),
    status: z.enum(['published', 'wip', 'pending']),
    date: z.string().optional(),
    author: z.string().default('Carola & Martín'),
    cardImage: z.string(),
    coverImage: z.string(),
    highlights: z.array(z.string()).default([]),
    hasRatings: z.boolean().default(false),
    ratings: z.object({
      budget: z.number().min(0).max(5).default(0),
      adventure: z.number().min(0).max(5).default(0),
      food: z.number().min(0).max(5).default(0),
      overall: z.number().min(0).max(5).default(0),
    }),
    odooPath: z.string().optional(),
  }),
});

export const collections = { destinations };
