// Generates /sitemap.xml — submit this URL in Google Search Console.
// Only finished ("published") guides are listed; see isIndexable() in src/lib/seo.ts.
import type { APIRoute } from 'astro';
import { absoluteUrl, escapeXml, guideUrl, getPublishedGuides, latestDate, modifiedDate } from '../lib/seo';

export const GET: APIRoute = async () => {
  const guides = await getPublishedGuides();
  const latest = latestDate(guides);

  const urls: { loc: string; lastmod?: string; image?: string; priority: string }[] = [
    { loc: absoluteUrl('/'), lastmod: latest, priority: '1.0' },
    { loc: absoluteUrl('/destinations/'), lastmod: latest, priority: '0.9' },
    ...guides.map((entry) => ({
      loc: guideUrl(entry),
      lastmod: modifiedDate(entry),
      image: absoluteUrl(entry.data.coverImage),
      priority: '0.8',
    })),
    { loc: absoluteUrl('/contact/'), priority: '0.3' },
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}${
      u.image ? `\n    <image:image><image:loc>${escapeXml(u.image)}</image:loc></image:image>` : ''
    }
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
