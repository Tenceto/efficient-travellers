import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://martinsevilla.github.io',
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
