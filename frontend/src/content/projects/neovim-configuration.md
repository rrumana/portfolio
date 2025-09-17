---
title: "Neovim Configuration"
summary: "Purpose-built Neovim environment that balances speed, observability, and ergonomic workflows for daily engineering work."
featured: true
order: 6
techStack:
  - Neovim
  - Lua
  - Treesitter
  - LSP
heroImage: "/images/Neovim.png"
heroAlt: "Screenshot of the Neovim configuration"
primaryAction:
  label: "Project page"
  href: "/projects/neovim-configuration"
secondaryAction:
  label: "Browse config"
  href: "https://github.com/rrumana/Neovim"
---
## Philosophy
I rewrote my Neovim setup from scratch to internalize how each plugin, keymap, and autocmd fits
together. The config favors composable Lua modules, predictable startup time, and sensible defaults
that make pairing and maintenance painless.

## Highlights
- Treesitter-powered syntax highlighting and incremental selection tuned for Rust, Go, and Python.
- LSP client wrappers that manage diagnostics, code actions, and formatting with consistent visuals.
- A curated command palette, telescope pickers, and statusline telemetry so I can jump between
  projects without breaking flow.

## Lessons learned
Building a personal editor is an ongoing experiment. Iterating in Lua keeps changes testable, and the
repo documents decisions so future tweaks stay intentional instead of accidental.
