---
title: "Reverse Game of Life"
summary: "A completed Rust research project that pairs an optimized Game of Life engine and SAT-based predecessor solver with a machine-supported NP-completeness proof."
summaryShort: "A completed Rust solver, simulator, and machine-supported NP-completeness proof for finite-board predecessor existence."
kind: "project"
status: "completed"
year: 2025
featured: true
featuredRank: 1
order: 1
role: "Researcher and systems engineer"
impact: "Proved one-step finite-board predecessor existence NP-complete and built the solver, compiler, certificates, and independently checked proof artifacts behind the result."
cardTags: ["Rust", "WebAssembly", "SAT solving"]
accent: "ochre"
audience: "mixed"
techStack:
  - Rust
  - WebAssembly
  - portable SIMD
  - Rayon
  - CaDiCaL
  - ParKissat-RS
  - LRAT
  - CakeML
heroImage: "/images/Gospers_glider_gun_crop.gif"
heroImageDark: "/images/Gospers_glider_gun_crop_dark.gif"
heroAlt: "Conway's Game of Life simulation"
repoUrl: "https://github.com/rrumana/Reverse_Game_Of_Life"
toc:
  - id: "problem"
    label: "Problem"
  - id: "mathematical-result"
    label: "Mathematical result"
  - id: "software"
    label: "Software"
  - id: "verification-and-reproducibility"
    label: "Verification"
primaryAction:
  label: "Open repository"
  href: "https://github.com/rrumana/Reverse_Game_Of_Life"
secondaryAction:
  label: "Read paper"
  href: "/research/predecessor-existence-finite-game-of-life/"
---
## Problem
Conway's Game of Life is easy to run forward: every cell's next state is determined by its current neighborhood. Running it backward is different. Given a target board, the task is to decide whether any predecessor evolves into it and, when one exists, construct it.

This project approaches that question from both sides. The software encodes finite reverse instances as SAT and extracts concrete predecessors. The paper asks the corresponding decision question and establishes its computational complexity under a precise finite-board model.

## Mathematical result
The completed paper proves that `DB-PREIMAGE` is NP-complete: given an explicitly encoded rectangular Life board with a permanently dead exterior, deciding whether it has a one-step predecessor is NP-complete under polynomial-time many-one reductions. Membership in NP also holds for every fixed number of steps; the hardness result is specifically for one step.

The reduction compiles CNF-SAT into a bounded-fanout circuit made from NOT, OR, splitter, crossing, wire, and constant-one elements. Closed two-valued loops supply variables without exposing signals at the board edge. A deterministic band-and-trunk router places the circuit using eleven verified 450 × 450 composite Life tiles, checks that no wire reaches the boundary, and adds a complete blank macrotile frame. The emitted dense board has polynomial area and has a predecessor exactly when the original formula is satisfiable.

## Software
The repository is a Rust workspace with four distinct responsibilities:

- `gol` is the forward simulator. It combines bit-packed boards, Rust's portable SIMD, automatic vector-width selection, and Rayon parallelism, with a WebAssembly wrapper powering the interactive demo below.
- `rev_gol` converts cell transitions, boundary conditions, and target-state constraints into CNF. It can solve with single-threaded CaDiCaL or multithreaded ParKissat-RS, enumerate multiple predecessors, and validate every result by forward simulation.
- `rev_gol_proof` compiles arbitrary DIMACS CNF into the explicit finite boards used by the theorem and records the circuit, routing, assets, dimensions, hashes, and polynomial bounds in recomputable certificates.
- `text_to_input` turns text and simple patterns into grid inputs for experiments and examples.

## Verification and reproducibility
The proof tooling pins all eleven large composite patterns by SHA-256 and reconstructs them cell-for-cell from published constituents. It checks edge masks, ports, routing closure, board framing, local logical relations, and the actual size of each generated construction.

The completed 28-spec sweep contains 246 verified outcomes: 124 satisfiable queries with stored witnesses checked by direct Life simulation, and 122 unsatisfiable or charging queries emitted as LRAT proofs and accepted by the independently compiled CakeML `cake_lpr` checker. The compiler can stream the theorem's explicit dense matrix without materializing boards that may contain hundreds of millions of cells, while also producing compact RLE files for inspection.

The [paper](/research/predecessor-existence-finite-game-of-life/) states the theorem, construction, trusted boundary, and limitations in full. The repository contains the implementation and the commands needed to regenerate its verification artifacts.
