# Content Collections

This folder houses Astro content collections used to power the portfolio. The initial collection,
`projects`, captures metadata for project listings and detail pages. Each entry includes frontmatter
for hero media, CTAs, and tech stacks so components can render consistently across the site.

Add new projects by creating a Markdown or MDX file in `projects/` with the required frontmatter and
body copy. The dynamic route at `src/pages/projects/[slug].astro` will automatically generate the
corresponding page using `ProjectLayout`.
