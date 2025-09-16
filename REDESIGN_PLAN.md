# Portfolio Redesign Blueprint

## 1. Goals
- Deliver a cohesive design language so every page feels like part of a single system.
- Replace one-off page layouts with reusable layouts and components that scale.
- Reduce styling drift by introducing shared tokens (color, typography, spacing) and a predictable component API.
- Improve authoring ergonomics so adding or updating pages is primarily content work.

## 2. Current State Audit

### 2.1 Directory & Build Setup
- `static/` contains hand-authored HTML pages (`index.html`, `game_of_life.html`, `ReID.html`, `homelab.html`, `about.html`). Each is self-contained and repeats large swaths of markup.
- `static/style/` holds SCSS partials grouped by sections (`_intro.scss`, `_projects.scss`, `_gol.scss`, etc.). These are section-specific, not component-oriented.
- Compiled CSS lives in `static/css/main.css`; Sass compilation is manual. JavaScript bundles sit in `static/javascript/`.
- There is no templating layer; shared elements (head tags, footer, CTA buttons) are copied across files.

### 2.2 Layout & Components
- Navigation is absent; each page starts directly with a hero or section, contributing to context switching.
- Sections rely on clip-path gradients and ad-hoc padding offsets to create separation. These styles differ per page, producing visual jumps when transitioning.
- Buttons (`cta-btn`) exist but are styled differently depending on modifier classes; colors vary by page.
- Card-like blocks (project listings, service grids) change spacing, typography, and shadow treatments between pages.
- Typography scale and line-height differ across pages; there is no central type system.
- Repeated assets (social icons, footers) are duplicated HTML + CSS.

### 2.3 Content Authoring Pain Points
- Adding a new project page requires copying an existing HTML file, manually editing head metadata, duplicating scripts, and inlining page-specific section styling.
- Styles rely on IDs (`#about`, `#projects`, etc.), making it difficult to remix components or reorder sections without editing SCSS per page.
- Animations depend on ScrollReveal scripts loaded everywhere, even when unused.

## 3. Design & Architecture Principles for the Rewrite
1. **Single Visual Language**: Define a shared set of layout primitives (page shell, sections, grids) and apply consistent spacing, radii, and shadows.
2. **Component-Driven Authoring**: Pages should be composed from reusable building blocks (e.g., `<Hero>`, `<Section>`, `<CardGrid>`, `<FeatureList>`).
3. **Design Tokens**: Centralize colors, typography, breakpoints, spacing, and elevation in a token file for easy theming.
4. **Content & Presentation Separation**: Use a templating/static-site framework so content lives in Markdown/MDX or JSON, and presentation is handled by layouts/components.
5. **Progressive Enhancements**: Only load JavaScript when a component needs it (e.g., interactive demos) to keep pages lightweight.
6. **Accessibility & Responsiveness First**: Ensure semantic HTML, focus states, and responsive behavior are part of the component contracts.

## 4. Proposed Tech Stack & Project Structure

### 4.1 Framework
Adopt **Astro** as the static site generator while keeping the existing Rust runtime in place:
- Provides component-based authoring with zero-JS-by-default pages.
- Supports Markdown/MDX for content (project writeups) and can integrate React/Svelte components for interactive demos when required.
- Offers file-based routing with layouts, greatly reducing duplication of head/meta markup.
- Plays well with existing assets and can emit a static bundle deployable anywhere.
- Astro's build output (`dist/`) can replace the current `static/` artifacts without changing the Rust server; the Rust backend continues to serve assets and host high-performance/WASM features.

Alternative: Eleventy. Astro is chosen for its ergonomic component syntax, built-in islands architecture, and strong developer experience while still allowing a Rust-first runtime story.

### 4.2 Project Layout
```
portfolio-rewrite/
├── src/
│   ├── components/
│   │   ├── hero/
│   │   ├── sections/
│   │   ├── cards/
│   │   └── navigation/
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── ProjectLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── projects/
│   │   │   ├── game-of-life.astro
│   │   │   ├── reid.astro
│   │   │   └── kubernetes-homelab.astro
│   │   └── contact.astro
│   ├── content/
│   │   └── projects/*.mdx (frontmatter-driven project metadata)
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── globals.css
│   │   └── components/
│   └── utils/
├── public/ (static assets: images, favicon, wasm builds)
├── astro.config.mjs
├── package.json
└── README.md
```

### 4.3 Styling Strategy
- Replace Sass with **CSS Modules + PostCSS** (or keep Sass if desired) but introduce **design tokens** via CSS custom properties in `tokens.css`:
  - Color palette (primary, accent, neutrals)
  - Typography scale (font families, weights, line heights)
  - Spacing scale (4/8-based grid)
  - Border radii and shadow elevations
- `globals.css` applies resets (modern CSS reset), base typography, and body background.
- Each component receives its own CSS module for scoped styles built on tokens (e.g., `Button.module.css`).
- Shared utility classes (e.g., layout wrappers, visually hidden) live in a small utility file to avoid redefinition.

### 4.4 UI System
Define a reusable component set:
- **Shell Components**: `SiteHeader`, `MobileNav`, `SiteFooter`, `PageSection`, `Container`.
- **Typography**: `Heading`, `Text`, `Lead`, `Eyebrow` components enforce consistent font sizes.
- **Buttons**: `Button` with variants (primary, secondary, link) and consistent states.
- **Cards**: `ProjectCard`, `StatCard`, `FeatureCard` sharing consistent padding, border radius, and elevation.
- **Media Blocks**: `ImageWithCaption`, `VideoEmbed` with responsive behavior.
- **Layout Patterns**: `SplitSection` (media + content), `GridSection`, `Timeline`, `Accordion`.
- **Callouts**: `Quote`, `CallToAction`, `Badge` for metadata (tech stack, status).

Each page will compose these primitives, ensuring spacing and typography remain uniform.

### 4.5 Content Model
- Store project metadata (title, summary, tech stack, links, timeline) in MDX frontmatter (`content/projects/*.mdx`).
- Build dynamic project listings on the home page by querying Astro content collections.
- For deep-dive pages (Game of Life, Homelab), use a shared `ProjectLayout` that
  - Renders a hero with title + subtitle + CTA buttons derived from frontmatter.
  - Provides consistent navigation breadcrumbs and next/previous project links.
  - Wraps content with consistent spacing, typography, and aside blocks for stats.

### 4.6 Theming & Extensibility
- With tokens centralized, future restyling (dark mode, accent changes) only modifies `tokens.css`.
- Add theme toggling later by defining `:root[data-theme="dark"]` overrides if desired.
- Document the component props and usage in a `/design-system` page or Storybook-like sandbox (optional but recommended).

## 5. Migration Strategy
1. **Bootstrap Astro project** inside `portfolio-rewrite`, migrating existing assets to `public/`, and wire the build pipeline so `astro build` publishes into the directory the Rust server already serves (or is copied into `static/`).
2. **Implement tokens & global styles**; iterate on typography and color palette to modernize the feel while preserving personal branding.
3. **Build shell components** (header, footer, container, section) and replace duplicated markup.
4. **Create hero, section, and card components**; rebuild the `index` page as a reference implementation.
5. **Migrate project pages** to MDX/Astro using `ProjectLayout`, ensuring metadata is centralized.
6. **Port interactive features** (WASM Game of Life demo) as isolated Astro islands that hydrate only the interactive portion.
7. **Introduce navigation** with top-level nav links and consistent breadcrumbs on subpages.
8. **Audit accessibility** (semantic headings, skip links, focus rings) before launch.
9. **Add documentation** describing the component library and contribution guidelines for future changes.

## 6. Future Enhancements (Post-Refactor)
- Implement a CMS-friendly pipeline (e.g., content stored in Markdown but editable via Git-based CMS such as Netlify CMS).
- Add theming/dark mode by leveraging the established token system.
- Introduce automated visual regression tests (Playwright) once the design system is stable.
- Package key components as a separate UI library if future Rust/WASM projects need the same design language.

---
By shifting to a framework with component-driven authoring, centralized tokens, and reusable layouts, every page will share the same DNA. Future additions will be faster and safer, and design updates will propagate uniformly across the entire site.
