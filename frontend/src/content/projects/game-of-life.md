---
title: "Reverse Game of Life"
summary: "A full-stack experiment in reversing Conway's Game of Life: SIMD-optimized engines, SAT-based predecessors, and a browser playground powered by Rust + WASM."
featured: true
order: 1
techStack:
  - Rust
  - WebAssembly
  - SAT Solvers
  - TypeScript
  - Vite / Astro
heroImage: "/images/Gospers_glider_gun_crop.gif"
heroImageDark: "/images/Gospers_glider_gun_crop_dark.gif"
heroAlt: "Conway's Game of Life simulation"
primaryAction:
  label: "Read more"
  href: "/projects/game-of-life"
secondaryAction:
  label: "View repo"
  href: "https://github.com/rrumana/game_of_life_reverse"
---
## Overview
Reverse Game of Life turns Conway's classic cellular automaton on its head. Instead of just pushing the grid forward, it asks the inverse question: *what state could have produced this pattern?* The stack spans several crates bundled with a Rust+WASM playground so you can watch your own phrases emerge from chaos in the browser.

## Highlights
- SIMD-bit-packed engine auto-detects hardware features, hitting 10,000x speedup over baseline.
- SAT-based reverse solver supports both CaDiCaL and ParKissat backends, validated by forward engine.
- Browser playground is WASM-first: draw, rewind, multi-step, convert text to grids, and export GIFs

## Lessons learned
- Constraint shape matters as much as solver choice: trimming clause duplication delivered order-of-magnitude speedup before any solver tuning.
- In the engine portion bit-packing and SIMD delivered the biggest runtime gains
- The SAT portion benefited more from clean encodings than exotic heuristics.
