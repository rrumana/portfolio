---
title: "Predecessor Existence for Explicit Finite Game-of-Life Boards with a Permanently Dead Boundary is NP-Complete"
shortTitle: "Finite Game-of-Life Predecessor Existence is NP-Complete"
summary: "A machine-supported proof that one-step predecessor existence is NP-complete for explicitly encoded finite Game-of-Life boards with a permanently dead exterior."
abstract: "This paper proves NP-completeness for deciding whether an explicitly encoded rectangular Conway's Game of Life board, evaluated with a permanently dead exterior, has a one-step predecessor. The reduction compiles nonempty 3-CNF into a bounded-fanout Boolean circuit, routes it through verified composite Life tiles, and emits a polynomial-area dense board isolated from the finite boundary. Companion tooling reconstructs the documented composites, simulates satisfying witnesses, and checks LRAT proofs for the unsatisfiable cases."
format: "independent-paper"
stage: "complete"
availability: "public"
lastUpdated: 2026-07-30
completedDate: 2026-07-30
displayDate: "July 2026"
authors:
  - name: "Ryan Rumana"
    url: "https://github.com/rrumana"
topics:
  - Complexity theory
  - Cellular automata
  - SAT solving
  - Machine-checked artifacts
venue: "Independent research"
citation: "Rumana, R. (2026). Predecessor Existence for Explicit Finite Game-of-Life Boards with a Permanently Dead Boundary is NP-Complete."
version: "July 2026"
pageCount: 16
sha256: "235e6a161b3f846d9382d92b3b36f1292b9639d2ef4165179baf747324a64911"
artifacts:
  - kind: "pdf"
    label: "Download PDF"
    url: "/research/predecessor-existence-finite-game-of-life.pdf"
  - kind: "repository"
    label: "Repository"
    url: "https://github.com/rrumana/Reverse_Game_Of_Life"
  - kind: "artifact"
    label: "Verification artifact"
    url: "https://github.com/rrumana/Reverse_Game_Of_Life"
relatedProjectUrl: "/projects/game-of-life/"
featuredRank: 1
---

## Result

The paper establishes NP-completeness for `DB-PREIMAGE`: given a rectangular board written explicitly as a dense matrix of bits, determine whether some board of the same dimensions evolves into it after one Life step when every out-of-board cell is permanently dead.

The boundary and encoding choices are part of the theorem. A finite dead exterior constrains the predecessor, while dense encoding requires the reduction to emit a board whose area is polynomial in the formula size. The construction addresses both conditions directly instead of treating them as consequences of the infinite-grid problem.

## Construction

The reduction compiles a nonempty 3-CNF formula into a bounded-fanout circuit over NOT, OR, splitter, and constant-one elements. Closed two-valued source loops provide independent variable assignments without relying on inputs at the board edge.

That circuit is routed deterministically over eleven documented 450 × 450 composite tiles. A complete blank macrotile frame separates all active structure—and its predecessor halo—from the finite boundary. The resulting explicit board has area `O(S²)` in the formula size.

## Reproducibility

The companion Rust workspace treats verification as part of the result. It reconstructs all eleven composites from their documented constituents, validates their Boolean relations, directly simulates satisfying witnesses, and generates proof artifacts for unsatisfiable queries.

The reported sweep contains 246 queries: 124 satisfiable cases and 122 unsatisfiable cases. The latter are emitted as LRAT proofs and checked with an independently compiled `cake_lpr`. Deterministic certificates record the formula, pinned assets, routed tile circuit, board dimensions, hashes, and polynomial-size bounds.

## Scope

The hardness result is for one Life step, explicit dense rectangular boards, and a permanently dead exterior. Membership in NP also holds for every fixed number of steps, but the paper does not claim NP-hardness for fixed values greater than one. RLE output is available for visualization, but it is not the encoding used by the complexity result.
