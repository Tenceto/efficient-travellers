// Shared builders for llms.txt, llms-full.txt and the per-guide Markdown copies.
import type { CollectionEntry } from 'astro:content';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  absolutizeMarkdown,
  getDescription,
  guideMarkdownUrl,
  guideUrl,
  modifiedDate,
  publishedDate,
  ratingsText,
} from './seo';

type Destination = CollectionEntry<'destinations'>;

export const REGIONS = ['Asia', 'Europe', 'Latin America', 'United States', 'Africa'] as const;

export const ABOUT = `${SITE_NAME} is a travel blog written by Carola (from Italy) and Martín (from Argentina), a couple based in Zurich. ${SITE_DESCRIPTION} Every guide follows the same structure: "Let's start" (introduction and practical "Before you go" notes), "TL;DR" (key takeaways), "Efficiency tips" (transport, money, SIM cards, where to sleep), "Authentic experiences", a day-by-day "Itinerary", and "Food" recommendations. Guides focus on budget-friendly, first-hand advice from trips the authors actually took.`;

/** Header block with the guide's metadata, in Markdown. */
export function guideHeader(entry: Destination): string {
  const lines = [
    `# ${entry.data.title}`,
    '',
    `> ${getDescription(entry)}`,
    '',
    `- URL: ${guideUrl(entry)}`,
    `- Authors: ${entry.data.author}`,
    `- Region: ${entry.data.region}`,
  ];
  const published = publishedDate(entry);
  const modified = modifiedDate(entry);
  if (published) lines.push(`- Published: ${published}`);
  if (modified && modified !== published) lines.push(`- Updated: ${modified}`);
  if (entry.data.highlights.length) lines.push(`- Places covered: ${entry.data.highlights.join(', ')}`);
  const ratings = ratingsText(entry);
  if (ratings) lines.push(`- Authors' ratings: ${ratings}`);
  lines.push(`- Source: ${SITE_NAME} (${absoluteUrl('/')})`);
  return lines.join('\n');
}

/** Full guide as clean Markdown (header + original body with absolute URLs). */
export function guideMarkdown(entry: Destination): string {
  const body = absolutizeMarkdown(entry.body ?? '')
    .replace(/<div data-trip-map><\/div>/g, '') // map placeholder (rendered on the HTML page only)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return `${guideHeader(entry)}\n\n---\n\n${body}\n`;
}

/** One-line entry for llms.txt. */
export function guideLink(entry: Destination): string {
  return `- [${entry.data.title}](${guideMarkdownUrl(entry)}): ${getDescription(entry)} (HTML: ${guideUrl(entry)})`;
}
