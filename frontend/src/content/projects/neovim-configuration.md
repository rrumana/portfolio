---
title: "Neovim Configuration"
summary: "A maintained Neovim configuration focused on fast startup, predictable editing, and a toolchain that supports Rust, infrastructure, and daily terminal work."
summaryShort: "A maintained Neovim setup centered on speed, predictable editing, and terminal-first work."
kind: "project"
status: "active"
year: 2024
featured: false
featuredRank: 8
order: 6
role: "Editor maintainer and workflow owner"
impact: "Consolidated my day-to-day editing workflow into a configuration that stays fast, reproducible, and easier to evolve."
cardTags: ["Neovim", "Lua", "LSP"]
accent: "pine"
audience: "technical"
techStack:
  - Lazy.nvim
  - Neovim
  - Lua
  - LSP
  - blink.cmp
  - Treesitter
  - Telescope
  - Harpoon
  - Gitsigns
  - Fugitive
  - Trouble
heroImage: "/images/Neovim.png"
heroAlt: "Screenshot of the Neovim configuration"
repoUrl: "https://github.com/rrumana/Neovim"
primaryAction:
  label: "Browse config"
  href: "https://github.com/rrumana/Neovim"
---
## Purpose
This configuration exists to keep the editor fast, predictable, and easy to maintain. The goal is not to maximize plugin count; it is to preserve a workflow that stays usable across Rust, infrastructure, and shell-heavy repositories.

## Current setup
Lazy.nvim handles plugin loading, while Treesitter, LSP, and completion provide language-aware editing. Telescope and Harpoon cover search and navigation. Gitsigns, Fugitive, Trouble, and Undotree round out the version-control and diagnostics layer so the editor remains practical for daily work.
