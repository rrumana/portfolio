---
title: "Reverse Game of Life"
summary: "An ongoing exploration of reverse Conway's Game of Life, pairing a Rust workspace with a browser-facing WebAssembly demo and SAT-based search."
summaryShort: "An ongoing Rust and WebAssembly project for reverse Game of Life search."
kind: "project"
status: "active"
year: 2025
featured: true
featuredRank: 1
order: 1
role: "Systems engineer and reverse-search implementer"
impact: "Turned a technical research problem into an accessible browser case study backed by a working solver workspace."
audience: "mixed"
techStack:
  - Rust
  - WebAssembly
  - SAT solving
  - SIMD
  - Rayon
  - CaDiCaL
  - ParKissat
heroImage: "/images/Gospers_glider_gun_crop.gif"
heroImageDark: "/images/Gospers_glider_gun_crop_dark.gif"
heroAlt: "Conway's Game of Life simulation"
repoUrl: "https://github.com/rrumana/Reverse_Game_Of_Life"
toc:
  - id: "overview"
    label: "Overview"
  - id: "approach"
    label: "Approach"
  - id: "status"
    label: "Status"
primaryAction:
  label: "Open repository"
  href: "https://github.com/rrumana/Reverse_Game_Of_Life"
secondaryAction:
  label: "Read whitepaper"
  href: "/research/predecessor-existence-finite-game-of-life/"
---
## Overview
Reverse Game of Life asks a simple question with a difficult answer: given a target pattern, what earlier board state could have produced it?

The project combines a browser-facing demo with a Rust workspace that handles forward simulation, reverse search, and proof-oriented tooling. The goal is not to turn the user interface into the hard part. The goal is to keep the problem visible while the implementation stays disciplined underneath it.

## Approach
The workspace is split along the same boundary that the problem itself suggests. The interactive layer is small and responsive, while the solver-side code handles the combinatorial search and validation work outside the browser.

That structure keeps the project practical. The public demo stays easy to understand, and the underlying workspace can continue to evolve as the reverse solver and proof tooling mature.

## Status
This remains an active project that started in 2025 and is still being extended. The solver and proof tooling now support a July 2026 whitepaper proving NP-completeness for predecessor existence on explicitly encoded finite boards with a permanently dead boundary.
