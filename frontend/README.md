# Astro frontend

This directory contains the Astro 7 static frontend for rcrumana.xyz. Astro generates HTML and content-hashed assets into `../static/dist`; the Rust/Axum process serves that output in staging and production.

There is no Astro server runtime in production. Keep page rendering static-first and use browser JavaScript only where interaction materially improves the content. The Game of Life demonstration runs locally in the browser through WebAssembly and has no public backend API dependency.

## Structure

```text
src/pages/                 Route entry points
src/content/projects/      Project case studies
src/content/research/      Research records and long-form summaries
src/content.config.ts      Collection schemas
src/components/            Shared UI and domain components
src/layouts/               Page shells
src/styles/                Global styles and design tokens
src/site.config.ts         Site-wide identity and navigation
public/                    Stable assets copied into the build
docs/                      Design and content guidance
```

Do not edit `../static/dist` directly. It is generated output.

## Commands

Use Node.js 24 and the locked npm dependency graph.

```bash
npm ci
npm run dev       # local Astro server
npm run check     # Astro and TypeScript diagnostics
npm run build     # static output in ../static/dist
npm run preview   # preview the generated site
```

Before a release, also run the Playwright browser suite, including axe assertions, as described in [validation and QA](../docs/validation.md).

## Authoring

Projects and research have different editorial jobs. A project explains engineering work and ownership; a research entry records a specific technical result, its scope, authors, evidence, and artifact. Link related entries rather than duplicating their full narratives.

Research uses two plain-language dimensions:

- Work stage: **in-progress** or **complete**.
- Availability: **forthcoming** or **public**.

Do not use “published” as a synonym for “hosted on this website.” Reserve venue and peer-review language for work that actually has that status. See [content authoring](docs/content-authoring.md) for metadata and copy rules.

## Design

The visual direction is alpine editorial: clear typographic hierarchy, generous reading space, cool natural neutrals, restrained accents, and precise technical details. It should feel like a carefully edited field journal, not an application dashboard or a generic mountain-themed landing page.

Use shared tokens and components instead of page-local approximations. Preserve semantic headings, visible keyboard focus, useful alternative text, reduced-motion behavior, and adequate color contrast. See the [design system](docs/design-system.md).

## Privacy

Frontend code must not add analytics, tracking pixels, fingerprinting, visitor IDs, or identity-bearing storage. Local-only presentation preferences are acceptable. The retired `/api/logs` and `/api/game-of-life/*` routes must remain unavailable. See [security and privacy](../docs/security-privacy.md).

## Assets

- Prefer descriptive, stable, lowercase filenames without spaces.
- Optimize raster assets and provide meaningful alternative text when the image carries information.
- Keep research PDFs under stable `/research/` URLs and record their checksum and page count in content metadata.
- Do not publish private infrastructure diagrams, internal URLs, credentials, access tokens, or identifying cluster topology.
