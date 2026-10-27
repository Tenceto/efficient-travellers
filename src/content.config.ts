import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const destinations = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/destinations' }),
  schema: z.object({
    title: z.string(),
    region: z.enum(['Asia', 'Europe', 'Latin America', 'United States', 'Africa']),
    status: z.enum(['published', 'wip', 'pending']),
    date: z.string().optional(),
    // Optional: date of the last significant update, same format as `date`.
    updated: z.string().optional(),
    // Optional SEO fields (never shown on the page). If omitted they are
    // generated automatically from the title, highlights and TL;DR.
    description: z.string().optional(),
    seoTitle: z.string().optional(),
    author: z.string().default('Carola & Martín'),
    cardImage: z.string(),
    coverImage: z.string(),
    highlights: z.array(z.string()).default([]),
    hasRatings: z.boolean().default(false),
    // Optional: places shown on the interactive map of the guide.
    // `day` (or `group`) links the pin to its section and colours/filters it;
    // pins are numbered in the order they appear in this list.
    // Optional: join the map pins with a dashed line in trip order (road trips).
    mapRoute: z.boolean().default(false),
    places: z
      .array(
        z.object({
          name: z.string(),
          lat: z.number(),
          lng: z.number(),
          day: z.number().optional(),
          // Optional: label used to colour/filter pins instead of the day (e.g. "Hanoi").
          group: z.string().optional(),
          type: z.enum(['sight', 'nature', 'waterfall', 'hot-spring', 'activity', 'town', 'food']).default('sight'),
          note: z.string().optional(),
          // Optional: id of the heading to link to (defaults to the day's section, or "food").
          section: z.string().optional(),
        })
      )
      .default([]),
    ratings: z.object({
      budget: z.number().min(0).max(5).default(0),
      adventure: z.number().min(0).max(5).default(0),
      food: z.number().min(0).max(5).default(0),
      overall: z.number().min(0).max(5).default(0),
    }),
  }),
});

export const collections = { destinations };
