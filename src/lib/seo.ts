/**
 * Central SEO helpers.
 *
 * Everything search engines and AI crawlers see (meta tags, structured data,
 * sitemap, RSS, llms.txt, Markdown copies) is derived from the frontmatter of
 * each file in src/content/destinations/. To add a new guide you only write
 * the Markdown file as usual — nothing here needs to change.
 */
import type { CollectionEntry } from 'astro:content';

type Destination = CollectionEntry<'destinations'>;

// ---------------------------------------------------------------------------
// Site-wide constants (edit here if the name, URL or authors ever change)
// ---------------------------------------------------------------------------
export const SITE_NAME = 'Efficient Travellers';
export const SITE_TAGLINE = 'Short, Budget-Friendly Travel Guides & Itineraries';
export const SITE_DESCRIPTION =
  'Short, clear, and efficient travel guides for savvy travellers — all the essentials without the fluff or spoilers.';
export const SITE_LANG = 'en';
export const SITE_LOCALE = 'en_US';
export const DEFAULT_AUTHOR = 'Carola & Martín';
export const DEFAULT_OG_IMAGE = '/images/home/IMG_4916.webp';
export const LOGO_IMAGE = '/images/logo/png/01-isotype-light.png';

/** People behind the blog, used in structured data. */
export const AUTHORS = [
  { name: 'Carola', description: 'Italian traveller and co-author of Efficient Travellers.' },
  { name: 'Martín', description: 'Argentinian traveller and co-author of Efficient Travellers.' },
];

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------
const rawBase = import.meta.env.BASE_URL || '/';
export const BASE = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
const SITE_ORIGIN = (import.meta.env.SITE || 'https://efficienttravellers.com').replace(/\/$/, '');

/** Prefixes a root-relative path with the base path (idempotent). */
export function withBase(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  if (BASE && (path === BASE || path.startsWith(`${BASE}/`))) return path;
  return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Absolute URL (https://…) for a root-relative path. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_ORIGIN}${withBase(path)}`;
}

export const HOME_URL = absoluteUrl('/');
export const BLOG_URL = absoluteUrl('/blog/');

export function guidePath(entry: Destination): string {
  return `/blog/${entry.id}/`;
}
export function guideUrl(entry: Destination): string {
  return absoluteUrl(guidePath(entry));
}
export function guideMarkdownUrl(entry: Destination): string {
  return absoluteUrl(`/blog/${entry.id}.md`);
}

// ---------------------------------------------------------------------------
// Indexing rules
// ---------------------------------------------------------------------------
/**
 * Only finished guides are published. "wip" and "pending" entries get no page
 * at all and are left out of the sitemap, RSS and llms.txt.
 * They get a page automatically when their status is set to "published".
 */
export function isIndexable(entry: Destination): boolean {
  return entry.data.status === 'published';
}

export function sortByOrder(entries: Destination[]): Destination[] {
  return [...entries].sort((a, b) => a.data.order - b.data.order);
}

// ---------------------------------------------------------------------------
// Dates — frontmatter uses human dates like "22 April 2025"
// ---------------------------------------------------------------------------
const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

/** Converts "22 April 2025" / "April 2025" / "2025" / "2025-04-22" to "2025-04-22". */
export function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const v = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, '0');
  let m = v.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (m && MONTHS[m[2].toLowerCase()]) return `${m[3]}-${pad(MONTHS[m[2].toLowerCase()])}-${pad(+m[1])}`;
  m = v.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (m && MONTHS[m[1].toLowerCase()]) return `${m[3]}-${pad(MONTHS[m[1].toLowerCase()])}-${pad(+m[2])}`;
  m = v.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (m && MONTHS[m[1].toLowerCase()]) return `${m[2]}-${pad(MONTHS[m[1].toLowerCase()])}-01`;
  m = v.match(/^(\d{4})$/);
  if (m) return `${m[1]}-01-01`;
  return undefined;
}

export function publishedDate(entry: Destination): string | undefined {
  return toIsoDate(entry.data.date);
}
export function modifiedDate(entry: Destination): string | undefined {
  return toIsoDate(entry.data.updated) ?? publishedDate(entry);
}

/** Most recent modification date among the given entries. */
export function latestDate(entries: Destination[]): string | undefined {
  return entries.map(modifiedDate).filter(Boolean).sort().pop();
}

// ---------------------------------------------------------------------------
// Text extraction from the Markdown body
// ---------------------------------------------------------------------------
/** Strips Markdown syntax to plain text. */
export function stripMarkdown(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links
    .replace(/<[^>]+>/g, '') // html
    .replace(/(\*\*|__|\*|_|`)/g, '')
    .replace(/^\s*#+\s*/gm, '')
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, '')
    .replace(/\(affiliate link\)/gi, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/** Returns the raw Markdown under the first "## <heading>" matching the regex. */
function sectionUnder(body: string, heading: RegExp): string | undefined {
  const lines = body.split('\n');
  const start = lines.findIndex((l) => /^##\s/.test(l) && heading.test(l.replace(/^##\s+/, '')));
  if (start === -1) return undefined;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^##\s/.test(l));
  return (end === -1 ? rest : rest.slice(0, end)).join('\n');
}

/** The bullet points of the "TL;DR" section (empty if the guide has none). */
export function getTldr(entry: Destination): string[] {
  const section = sectionUnder(entry.body ?? '', /^TL;?\s*DR/i);
  if (!section) return [];
  const bullets: string[] = [];
  for (const line of section.split('\n')) {
    if (/^\s*[-*+]\s+/.test(line)) bullets.push(line.replace(/^\s*[-*+]\s+/, ''));
    else if (bullets.length && line.trim() && !/^\s*!\[/.test(line)) bullets[bullets.length - 1] += ` ${line.trim()}`;
  }
  return bullets.map(stripMarkdown).filter(Boolean);
}

/** First real paragraph of the guide (used when there is no TL;DR). */
export function getIntro(entry: Destination): string {
  const body = entry.body ?? '';
  const intro = sectionUnder(body, /^Let.s start/i) ?? body;
  const para = intro
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith('#') && !p.startsWith('!') && !/^[-*+]\s/.test(p));
  return para ? stripMarkdown(para) : '';
}

/** Short abstract for structured data and llms.txt: TL;DR bullets or the intro. */
export function getAbstract(entry: Destination): string {
  const tldr = getTldr(entry);
  return tldr.length ? tldr.join(' ') : getIntro(entry);
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\-–—\s]+$/, '')}…`;
}

/**
 * Meta description: the optional `description` frontmatter field, otherwise
 * generated from the title, places and TL;DR/intro.
 */
export function getDescription(entry: Destination): string {
  if (entry.data.description) return entry.data.description;
  const places = entry.data.highlights.length ? ` (${entry.data.highlights.join(', ')})` : '';
  const lead = `${entry.data.title}${places}: itinerary, efficiency tips, authentic experiences and food.`;
  const extra = getTldr(entry)[0] ?? getIntro(entry);
  return truncate(extra ? `${lead} ${extra}` : lead, 160);
}

/** <title> for a guide: optional `seoTitle` frontmatter, otherwise generated. */
export function getSeoTitle(entry: Destination): string {
  if (entry.data.seoTitle) return entry.data.seoTitle;
  if (!isIndexable(entry)) return `${entry.data.title} | ${SITE_NAME}`;
  return `${entry.data.title}: Itinerary & Travel Tips | ${SITE_NAME}`;
}

export function wordCount(entry: Destination): number {
  return stripMarkdown(entry.body ?? '').split(/\s+/).filter(Boolean).length;
}

/** Makes image/link paths inside a Markdown body absolute. */
export function absolutizeMarkdown(md: string): string {
  return md.replace(/\]\((\/[^)\s]*)/g, (_, p) => `](${absoluteUrl(p)}`);
}

// ---------------------------------------------------------------------------
// Structured data (schema.org JSON-LD)
// ---------------------------------------------------------------------------
export function personNodes(author: string = DEFAULT_AUTHOR) {
  const names = author.split(/\s*(?:&|,|\band\b)\s*/).filter(Boolean);
  return names.map((name) => {
    const known = AUTHORS.find((a) => a.name.toLowerCase() === name.toLowerCase());
    return {
      '@type': 'Person',
      '@id': `${HOME_URL}#${encodeURIComponent(name.toLowerCase())}`,
      name,
      ...(known ? { description: known.description, url: `${HOME_URL}#about-us` } : {}),
    };
  });
}

export const organizationNode = {
  '@type': 'Organization',
  '@id': `${HOME_URL}#organization`,
  name: SITE_NAME,
  url: HOME_URL,
  logo: { '@type': 'ImageObject', url: absoluteUrl(LOGO_IMAGE) },
};

export const websiteNode = {
  '@type': 'WebSite',
  '@id': `${HOME_URL}#website`,
  name: SITE_NAME,
  alternateName: `${SITE_NAME} — ${SITE_TAGLINE}`,
  url: HOME_URL,
  description: SITE_DESCRIPTION,
  inLanguage: SITE_LANG,
  publisher: { '@id': `${HOME_URL}#organization` },
};

export function breadcrumbNode(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function guideJsonLd(entry: Destination) {
  const url = guideUrl(entry);
  const published = publishedDate(entry);
  const modified = modifiedDate(entry);
  const tldr = getTldr(entry);
  const article: Record<string, unknown> = {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: entry.data.title,
    name: getSeoTitle(entry).replace(` | ${SITE_NAME}`, ''),
    description: getDescription(entry),
    abstract: getAbstract(entry),
    url,
    mainEntityOfPage: url,
    image: [absoluteUrl(entry.data.coverImage), absoluteUrl(entry.data.cardImage)],
    inLanguage: SITE_LANG,
    author: personNodes(entry.data.author),
    publisher: { '@id': `${HOME_URL}#organization` },
    isPartOf: { '@id': `${HOME_URL}#website` },
    articleSection: entry.data.region,
    keywords: [entry.data.region, ...entry.data.highlights, 'itinerary', 'travel tips', 'budget travel'].join(', '),
    wordCount: wordCount(entry),
    encoding: {
      '@type': 'MediaObject',
      encodingFormat: 'text/markdown',
      contentUrl: guideMarkdownUrl(entry),
    },
  };
  if (published) article.datePublished = published;
  if (modified) article.dateModified = modified;
  if (entry.data.highlights.length) {
    article.about = entry.data.highlights.map((name) => ({ '@type': 'Place', name }));
  }
  if (tldr.length) {
    article.hasPart = {
      '@type': 'WebPageElement',
      name: 'TL;DR',
      cssSelector: '#tldr, #tl-dr',
      text: tldr.join('\n'),
    };
  }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      article,
      breadcrumbNode([
        { name: 'Home', url: HOME_URL },
        { name: 'Destinations', url: BLOG_URL },
        { name: entry.data.title, url },
      ]),
      organizationNode,
    ],
  };
}

/** Ratings as plain text (used in llms.txt / Markdown copies). */
export function ratingsText(entry: Destination): string | undefined {
  if (!entry.data.hasRatings) return undefined;
  const r = entry.data.ratings;
  return `Budget-friendly ${r.budget}/5, Adventure ${r.adventure}/5, Food ${r.food}/5, Overall ${r.overall}/5`;
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
