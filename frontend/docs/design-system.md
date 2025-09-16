# Game of Life Page Styling Plan

## Goals
- Present the long-form Game of Life content in a cohesive, modern layout while preserving literal copy.
- Establish reusable UI patterns (accordions, TOC, formulas, code snippets) for future deep dives.
- Maintain strong light/dark theme contrast and accessibility.

## Layout Primitives
- **ContentGrid**: Responsive two-column layout with sticky navigation on desktop and stacked layout on mobile. Suitable for any extensive article or project case study.
- **SectionShell**: Wrapper for major sections (Optimizations, Proof, Implementation) providing consistent spacing, anchor ids, and optional accent borders.
- **SurfaceCard**: Token-driven card component with variants (`default`, `elevated`, `outline`) for optimization panels, feature lists, and CLI cards across the site.

## Typography & Tokens
- Extend `Heading` sizes (`xs`–`4xl`) and `Text` tones (`muted`, `accent`, `warning`).
- Introduce inline emphasis helpers (`.math-term`, `.code-term`, `.highlight`) mapped to token colors.
- Finalize light/dark surface and border tokens (`surface-100/200/300`, `border-100/200/300`) so stacked cards feel consistent.

## Disclosure Patterns
- **Accordion**: Accessible disclosure component with customizable headers and nested support—ideal for optimization subsections and proof steps.
- **AccordionGroup**: Groups related accordions with shared heading and optional navigation. Useful for FAQs, runbooks, or feature breakdowns.

## Navigation Helpers
- **StickyNav**: Vertical anchor list with scroll-spy highlighting; collapses to dropdown on mobile.
- Include “Back to top” and optional breadcrumbs for project detail pages.

## Code & CLI Presentation
- **CodeBlock**: Syntax-highlighted block (Prism/Shiki) with copy button and filename/language badge (Rust, Bash, YAML, JSON).
- **CommandCard**: Compact card for CLI command + description (formalize from legacy page for reuse).
- **CodeChip**: Inline styling for short commands/functions.

## Math & Formula Styling
- `.formula-card`: Padded container for MathJax blocks with theme-aware background and optional captions.
- `.formula-inline`: Inline math chip styling.
- Ensure MathJax output inherits tokenized fonts/colors.

## Feature & Data Grids
- **FeatureGrid**: Responsive icon/title/description grid for SAT solver features or platform highlights.
- **StatsStrip**: Horizontal key-value list for quick metrics (grid size, live cell counts) reusable on homelab metrics sections.

## Callouts & Highlights
- **Callout** component with variants (`info`, `tip`, `warning`, `success`) for emphasis paragraphs.
- **QuoteBlock** for notable statements or testimonials.

## Media Frames
- **MediaFrame**: Stylized wrapper for images/GIFs with captions.
- **SimulationPanel**: Specialized wrapper for interactive canvases (Game of Life demo) incorporating stats and controls.

## Theming & Accessibility
- Apply final light/dark token palette across components for distinct surfaces, borders, and gradients.
- Provide visible focus states for accordions, navigation links, and copy buttons.
- Validate color contrast and keyboard navigation.

## Migration Steps
1. Implement shared components: `ContentGrid`, `SectionShell`, `SurfaceCard`, `Accordion`, `AccordionGroup`, `StickyNav`, `Callout`, `CodeBlock`, `CommandCard`, `FeatureGrid`, `MediaFrame`, `SimulationPanel`.
2. Refactor Game of Life page to use these components while keeping content intact.
3. Update global tokens/typography.
4. Style MathJax output within `.formula-card` wrappers.
5. Apply components to homelab and ReID pages for cohesive design.
6. Test responsiveness, accessibility, and theme toggles.

## Reuse Examples
- **Homelab**: `AccordionGroup` for runbooks, `FeatureGrid` for services, `CodeBlock` for deployments, `Callout` for HA notes.
- **ReID**: `MediaFrame` for pipeline diagrams, `Callout` for key results, `CommandCard` for inference commands.
- **Future tutorials**: `ContentGrid` + `StickyNav` for structure, `CodeBlock` + `Callout` for instructional segments.
