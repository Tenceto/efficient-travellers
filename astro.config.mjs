import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypeArticleImages from './src/lib/rehype-article-images.mjs';

const base = '/efficient-travellers';

export default defineConfig({
  site: 'https://tenceto.github.io',
  base,
  integrations: [mdx()],
  markdown: {
    rehypePlugins: [[rehypeArticleImages, { base }]],
  },
  build: {
    format: 'directory'
  },
  vite: {
    server: {
      allowedHosts: true
    }
  }
});
