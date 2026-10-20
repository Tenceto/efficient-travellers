# Efficient Travellers — Static Travel Blog (Astro + MDX)

Migrated from `https://efficienttravellers.odoo.com/` to a fully customizable **Astro + MDX** static site ready for **GitHub Pages**.

## Project Structure

- `src/content/destinations/*.md`: All **21 destinations** with typed frontmatter (`title`, `region`, `status`, `highlights`, `ratings`, `cardImage`, `coverImage`) and full Markdown content.
- `src/components/DestinationCard.astro`: Renders the destination card with bullet highlights and 4 star-rating bars (`Budget-friendly`, `Adventure`, `Food`, `Overall`).
- `src/components/StarRating.astro`: Reusable star rating bar component.
- `src/layouts/BaseLayout.astro`: Global header, instant client-side search bar, and footer.
- `src/pages/index.astro`: Homepage (Hero collage, About Us split block, About the Blog, Featured Guides).
- `src/pages/blog/index.astro`: Destinations Hub with interactive region filtering (`Asia`, `Europe`, `Latin America`, `United States`, `Africa`).
- `src/pages/blog/[slug].astro`: Individual destination guide layout with auto-generated sticky Table of Contents and sidebar ratings.
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
