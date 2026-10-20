import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://tenceto.github.io',
  base: '/efficient-travellers',
  integrations: [mdx()],
  build: {
    format: 'directory'
  },
  vite: {
    server: {
      allowedHosts: true
    }
  }
});
