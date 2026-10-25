/**
 * Rehype plugin applied to every Markdown guide at build time.
 *
 * - Adds loading="lazy" / decoding="async" to article images.
 * - Adds width/height (read from the file in /public) so the browser can
 *   reserve space before the image loads (better Core Web Vitals).
 * - Replaces placeholder alt texts that are just the file slug
 *   (e.g. "3-weeks-in-indonesia") with a descriptive one built from the
 *   guide title. A real alt text written in Markdown is always kept.
 *
 * Nothing changes visually.
 */
import { visit } from 'unist-util-visit';
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';

const SLUG_LIKE = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/i;

export default function rehypeArticleImages({ base = '/' } = {}) {
  const basePrefix = base.replace(/\/$/, '');
  return async (tree, file) => {
    const title = file.data?.astro?.frontmatter?.title;
    const images = [];
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') images.push(node);
    });

    let n = 0;
    for (const node of images) {
      n += 1;
      const props = node.properties || (node.properties = {});
      props.loading ??= 'lazy';
      props.decoding ??= 'async';

      const alt = typeof props.alt === 'string' ? props.alt.trim() : '';
      if (title && (!alt || SLUG_LIKE.test(alt))) {
        props.alt = `${title} — travel photo ${n}`;
      }

      const src = typeof props.src === 'string' ? props.src : '';
      if (src.startsWith('/') && props.width == null && props.height == null) {
        const rel = basePrefix && src.startsWith(`${basePrefix}/`) ? src.slice(basePrefix.length) : src;
        const filePath = path.join(process.cwd(), 'public', decodeURI(rel));
        if (fs.existsSync(filePath)) {
          try {
            const { width, height } = await sharp(filePath).metadata();
            if (width && height) {
              props.width = width;
              props.height = height;
            }
          } catch {
            /* ignore unreadable images */
          }
        }
      }
    }
  };
}
