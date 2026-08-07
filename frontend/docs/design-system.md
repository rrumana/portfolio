# Alpine editorial design system

The site combines the restraint of an alpine field guide with the clarity of a technical journal. “Alpine” describes atmosphere—air, stone, snow, timber, distance—not decorative mountain graphics. “Editorial” means content hierarchy and reading quality take precedence over interface chrome.

## Principles

1. **Lead with the work.** Titles, summaries, diagrams, and results are the visual anchors.
2. **Keep the terrain quiet.** Use cool neutrals, subtle borders, and one restrained accent. Avoid neon, glass effects, ornamental gradients, and stacked dashboard cards.
3. **Make long reading comfortable.** Keep prose measures near 65–72 characters, use generous vertical rhythm, and distinguish captions, metadata, code, and body copy.
4. **Show technical precision.** Monospace is for commands, identifiers, measurements, and proof notation—not general decoration.
5. **Earn interaction.** Prefer static HTML. Add disclosure, theme, or WASM behavior only when it helps readers understand or navigate the work.

## Typography

- Source Serif 4 is the editorial voice for long-form display or reading roles.
- Source Sans 3 carries navigation, summaries, labels, and UI copy.
- IBM Plex Mono carries code, formulas, artifact identifiers, and compact metadata.
- Preserve semantic heading order. Do not choose a heading level for its visual size.
- Avoid full paragraphs in uppercase, italic, or muted low-contrast text.

## Color and surfaces

Use the tokens in `src/styles/tokens.css`; do not embed new palette values in content components. Light and dark themes must preserve meaning and hierarchy, not merely invert colors.

- Page backgrounds should read as snow, cloud, slate, or ink rather than pure branded color.
- Accent color should identify links, focus, or a small number of key actions.
- Borders should separate regions without turning every paragraph into a card.
- Status must be communicated with text as well as color.

## Layout and components

- Use the shared shell, container, section, card, callout, media, code, and navigation components.
- A page should have one clear introduction, a predictable reading column, and a limited action hierarchy.
- Research pages should foreground title, authors, stage, availability, abstract, and artifact links before secondary metadata.
- Project pages should foreground role, outcome, architecture, and supporting evidence.
- Use a table only for genuine comparison or repeated fields. Use diagrams only when relationships are harder to understand in prose.

## Media and motion

- Write alternative text for the information conveyed, not the filename or visual style.
- Pair complex diagrams with captions or nearby explanations.
- Do not autoplay video or animation with sound.
- Honor `prefers-reduced-motion`; essential information cannot depend on animation.
- Keep images free of internal hostnames, addresses, credentials, dashboards containing private data, or identifying network topology.

## Accessibility acceptance

- All functionality is keyboard reachable, with visible focus.
- A skip link reaches the primary content.
- Landmarks and heading order describe the page correctly.
- Text and meaningful non-text controls meet WCAG AA contrast.
- At 200% zoom and narrow mobile widths, reading order and actions remain usable.
- Playwright journeys and axe checks pass before production promotion.

See [content authoring](content-authoring.md) for editorial conventions and [validation](../../docs/validation.md) for release checks.
