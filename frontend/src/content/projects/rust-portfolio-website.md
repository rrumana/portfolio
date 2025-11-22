---
title: "Rust-Based Portfolio Website"
summary: "An evolving portfolio platform powered by a Rust backend, Astro front end, and automation that keeps content, WASM demos, and deployments in sync."
featured: true
order: 5
techStack:
  - Rust
  - Axum
  - Astro
  - Docker
  - WASM
heroImage: "/images/portfolio.png"
heroAlt: "Screenshot of the portfolio website"
primaryAction:
  label: "Project details"
  href: "/projects/rust-portfolio-website"
secondaryAction:
  label: "Source code"
  href: "https://github.com/rrumana/portfolio"
---
## Why Rust + Astro
The site started as a static HTML project and matured into a Rust-first stack so I could bring backend reliability, strong typing, and WebAssembly experiments into the same codebase. Astro powers the new front end while Axum handles APIs, auth experiments, and homelab integrations.

## Platform highlights
- Shared content collections let the backend, Astro pages, and WASM apps reuse the same data model.
- Docker images bundle the backend binary with pre-rendered Astro assets for fast, repeatable deployments into my k3s cluster.
- CI scripts run `cargo fmt`, Clippy, and frontend builds to keep quality gates consistent across language boundaries.

## Roadmap
Dark mode, richer project pages, and automated WASM rebuilds are in flight. The goal is a portfolio
that feels as maintainable as a production service—with observability, integration tests, and clean
content workflows.
