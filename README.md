# Efficient Travellers — Static Travel Blog (Astro + MDX)

Migrated from `https://efficienttravellers.odoo.com/` to a fully customizable **Astro + MDX** static site ready for **GitHub Pages**.

## Project Structure

- `src/content/destinations/*.md`: All **destinations** (one Markdown file each) with typed frontmatter (`title`, `region`, `status`, `highlights`, `ratings`, `cardImage`, `coverImage`) and full Markdown content.
- `src/components/DestinationCard.astro`: Renders the destination card with bullet highlights and 4 star-rating bars (`Budget-friendly`, `Adventure`, `Food`, `Overall`).
- `src/components/StarRating.astro`: Reusable star rating bar component.
- `src/layouts/BaseLayout.astro`: Global header, instant client-side search bar, and footer.
- `src/pages/index.astro`: Homepage (Hero collage, About Us split block, About the Blog, Featured Guides).
- `src/pages/destinations/index.astro`: Destinations Hub with interactive region filtering (`Asia`, `Europe`, `Latin America`, `United States`, `Africa`).
- `src/pages/destinations/[slug].astro`: Individual destination guide layout with auto-generated sticky Table of Contents and sidebar ratings.
- `public/images/`: All high-resolution `.webp` and `.jpeg` images downloaded from Odoo.
- `.github/workflows/deploy.yml`: Automated GitHub Actions deployment to GitHub Pages.

## Local Development

```bash
npm install
npm run dev
```

## Deploying to GitHub Pages

1. Create a new repository on GitHub (e.g. `efficient-travellers` or `<username>.github.io`).
2. If deploying to a project subpath (`https://<username>.github.io/efficient-travellers/`), add `base: '/efficient-travellers'` to `astro.config.mjs`. If deploying to `<username>.github.io` or a custom domain, keep `astro.config.mjs` as-is.
3. In the GitHub repo, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
4. Push this repository:
   ```bash
   git remote add origin git@github.com:<username>/<repo>.git
   git push -u origin main
   ```

## SEO & AI discoverability

Everything below is generated automatically from each guide's frontmatter — when you add a new guide in `src/content/destinations/`, you don't need to touch any other file.

| Output | URL | Source |
| --- | --- | --- |
| Meta tags, canonical, Open Graph / Twitter cards | every page `<head>` | `src/layouts/BaseLayout.astro` |
| Structured data (JSON-LD: BlogPosting, BreadcrumbList, WebSite, Organization, Person) | every page `<head>` | `src/lib/seo.ts` |
| Sitemap (submit this in Google Search Console) | `/sitemap.xml` | `src/pages/sitemap.xml.ts` |
| RSS feed | `/rss.xml` | `src/pages/rss.xml.ts` |
| llms.txt index for AI agents | `/llms.txt` | `src/pages/llms.txt.ts` |
| Full text of all guides for AI agents | `/llms-full.txt` | `src/pages/llms-full.txt.ts` |
| Markdown copy of each guide | `/destinations/<slug>.md` | `src/pages/destinations/[slug].md.ts` |
| Lazy loading, sizes and alt text for article images | article `<img>` tags | `src/lib/rehype-article-images.mjs` |

### Writing a new guide

Use the usual frontmatter. These fields drive SEO:

- `title`, `region`, `highlights`, `date`, `author`, `coverImage`, `ratings`: reused everywhere (title tag, structured data, sitemap, llms.txt…). Write them once.
- `status`: only `"published"` guides are indexed. `"wip"` and `"pending"` pages get `noindex` and are left out of the sitemap, RSS and llms.txt. Switching to `"published"` makes them indexable automatically.
- `description` *(optional, recommended)*: the ~150-character snippet shown under your link in Google. If omitted, one is generated from the title, highlights and first TL;DR bullet.
- `seoTitle` *(optional)*: overrides the browser-tab / Google title. Default: `"<title>: Itinerary & Travel Tips | Efficient Travellers"`.
- `updated` *(optional)*: date of a significant update (same format as `date`, e.g. `"3 March 2027"`). Used as "last modified" in the sitemap and structured data.

Keep the `## TL;DR` section: its bullets become the article summary (`abstract`) in the structured data. Images whose alt text is just the file slug (e.g. `![3-weeks-in-indonesia](...)`) automatically get a descriptive alt; write a real alt text in Markdown if you want something specific.

Site-wide values (site name, tagline, authors, default share image) live at the top of `src/lib/seo.ts`.
