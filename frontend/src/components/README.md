# Component Library Overview

Components are organized by responsibility:

- `shell/`: layout scaffolding such as header, footer, container, and section wrappers.
- `ui/`: low-level primitives (typography, buttons, badges) that encapsulate token-driven styling.
- `layouts/`: composable layout patterns (grids, split sections) that arrange content.
- `cards/`: reusable card patterns for projects, stats, and similar content.
- `navigation/`: navigation elements shared across the site.
- `callouts/`: attention-grabbing blocks such as CTAs and badges.

Each component uses the shared design tokens defined in `src/styles/tokens.css` and ships with
scoped styles to prevent leakage across pages.
