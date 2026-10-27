// Generates /llms.txt (https://llmstxt.org) — an index of the site for AI agents.
import type { APIRoute } from 'astro';
import { SITE_NAME, absoluteUrl, getPublishedGuides } from '../lib/seo';
import { ABOUT, REGIONS, guideLink } from '../lib/llms';

export const GET: APIRoute = async () => {
  const guides = await getPublishedGuides();

  const sections = REGIONS.map((region) => {
    const items = guides.filter((e) => e.data.region === region);
    return items.length ? `## ${region}\n\n${items.map(guideLink).join('\n')}` : '';
  }).filter(Boolean);

  const body = `# ${SITE_NAME}

> Short, clear and budget-friendly travel guides and itineraries by Carola & Martín — all the essentials without the fluff or spoilers.

${ABOUT}

Each guide below links to a clean Markdown version. The complete text of every guide in one file is available at ${absoluteUrl('/llms-full.txt')}.

${sections.join('\n\n')}

## Site

- [Home](${absoluteUrl('/')}): About the authors and the blog.
- [All destinations](${absoluteUrl('/destinations/')}): Every guide, grouped by region.
- [Contact](${absoluteUrl('/contact/')}): Questions about itineraries, local guides or travel tips.
- [Sitemap](${absoluteUrl('/sitemap.xml')})
- [RSS feed](${absoluteUrl('/rss.xml')})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
