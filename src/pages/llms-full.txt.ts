// Generates /llms-full.txt — the full text of every published guide in one file.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_NAME, absoluteUrl, isIndexable, sortByOrder } from '../lib/seo';
import { ABOUT, guideMarkdown } from '../lib/llms';

export const GET: APIRoute = async () => {
  const guides = sortByOrder((await getCollection('destinations')).filter(isIndexable));
  const body = `# ${SITE_NAME} — full guides

> ${ABOUT}

Source: ${absoluteUrl('/')}

${guides.map((e) => guideMarkdown(e).replace(/^# /, '\n\n# ')).join('\n\n---\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
