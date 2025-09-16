# Astro Frontend Scaffolding

This directory hosts the Astro project that will produce the next iteration of the portfolio UI. The
existing Rust runtime remains responsible for serving requests and WebAssembly-powered features.

- `astro build` writes production assets to `../static/dist`, keeping the current `static/` directory
  intact for reference during the migration.
- Legacy HTML/CSS/JS files stay untouched inside `../static/` until each page is ported.
- Additional component, content, and style work will follow once the design token system is defined.
