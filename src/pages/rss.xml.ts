// Generates /rss.xml with every published guide (newest first).
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  escapeXml,
  getDescription,
  guideUrl,
  isIndexable,
  publishedDate,
} from '../lib/seo';

export const GET: APIRoute = async () => {
  const guides = (await getCollection('destinations'))
    .filter(isIndexable)
    .sort((a, b) => (publishedDate(b) ?? '').localeCompare(publishedDate(a) ?? ''));

  const items = guides
    .map((entry) => {
      const date = publishedDate(entry);
      return `    <item>
      <title>${escapeXml(entry.data.title)}</title>
      <link>${escapeXml(guideUrl(entry))}</link>
      <guid isPermaLink="true">${escapeXml(guideUrl(entry))}</guid>
      <description>${escapeXml(getDescription(entry))}</description>
      <category>${escapeXml(entry.data.region)}</category>${
        date ? `\n      <pubDate>${new Date(`${date}T12:00:00Z`).toUTCString()}</pubDate>` : ''
      }
      <dc:creator>${escapeXml(entry.data.author)}</dc:creator>
      <enclosure url="${escapeXml(absoluteUrl(entry.data.coverImage))}" type="${entry.data.coverImage.endsWith(".webp") ? "image/webp" : entry.data.coverImage.match(/\.png$/) ? "image/png" : "image/jpeg"}" length="0" />
    </item>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(absoluteUrl('/'))}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(absoluteUrl('/rss.xml'))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
