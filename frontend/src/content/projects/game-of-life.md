---
title: "Reverse Game of Life"
summary: "A Rust-powered exploration into inferring prior states of Conway's Game of Life using SAT solvers and WASM for interactive visualization."
featured: true
order: 1
techStack:
  - Rust
  - WebAssembly
  - SAT Solvers
  - TypeScript
heroImage: "/images/Gospers_glider_gun_crop.gif"
heroImageDark: "/images/Gospers_glider_gun_crop_dark.gif"
heroAlt: "Conway's Game of Life simulation"
primaryAction:
  label: "View project"
  href: "/projects/game-of-life"
secondaryAction:
  label: "Source code"
  href: "https://github.com/rrumana/game_of_life_reverse"
---
## Overview
Reverse Game of Life turns Conway's classic cellular automaton on its head. Instead of only simulating
future states, the project asks a harder question: *what grid could have produced this pattern?* The
solution encodes the game rules as a SAT problem, leans on Rust for performance, and ships a WASM
front end so visitors can experiment in the browser.

## Highlights
- Encodes cell transitions as boolean constraints and solves them via SAT to backtrack prior states.
- Ships a WASM-powered playground where you can draw patterns, step forward or backward, and export
  GIFs of the evolution.
- Includes Rust crates for simulation, constraint building, and wasm-bindgen bindings to keep the
  codebase modular and testable.

## Lessons learned
Modeling the automaton as SAT exposed performance trade-offs quickly: naïve encodings ballooned in
size, so I leaned on Rust's iterators and memory ownership to keep generation tight. The WASM layer
proved invaluable for debugging, because every change could be visualized immediately.
