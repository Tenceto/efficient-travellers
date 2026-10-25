// Generates /destinations/<slug>.md — a clean Markdown copy of each published guide for LLMs.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { isIndexable } from '../../lib/seo';
import { guideMarkdown } from '../../lib/llms';

export const getStaticPaths: GetStaticPaths = async () => {
  const entries = (await getCollection('destinations')).filter(isIndexable);
  return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
};

export const GET: APIRoute = ({ props }) => {
  const { entry } = props as { entry: CollectionEntry<'destinations'> };
  return new Response(guideMarkdown(entry), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
