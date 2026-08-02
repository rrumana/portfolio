---
title: "Self-Hosted Portfolio Website"
summary: "A portfolio site built to present projects, repositories, and papers through a static-first frontend, a Rust runtime, and a containerized deployment path."
summaryShort: "Rust-backed portfolio site for presenting projects, repositories, and papers."
kind: "project"
status: "active"
year: 2024
featured: true
featuredRank: 3
order: 5
role: "Full-stack developer and operator"
impact: "Built a maintainable portfolio platform with a clear deployment path from local builds to a live Kubernetes cluster."
audience: "mixed"
techStack:
  - Rust
  - Axum
  - Astro
  - TypeScript
  - WebAssembly
  - Docker
  - Kubernetes
heroImage: "/images/portfolio_light.png"
heroImageDark: "/images/portfolio_dark.png"
heroAlt: "Screenshot of the portfolio website"
repoUrl: "https://github.com/rrumana/portfolio"
toc:
  - id: "overview"
    label: "Overview"
  - id: "architecture"
    label: "Architecture"
  - id: "deployment"
    label: "Deployment"
primaryAction:
  label: "Repository"
  href: "https://github.com/rrumana/portfolio"
---
## Overview
This site is the public index of my work. Its primary job is to make projects easy to browse, give each one a stable home, and provide direct paths to the underlying repository or paper when those materials exist.

## Architecture
Rust + Axum runs serves the site and WebAssembly features while the frontend is built with Astro and TypeScript. The split between Rust and Typescript keeps the public pages simple and fast, while still leaving room for interactive elements such as the Reverse Game of Life demo.

## Deployment
The site is developed locally, containerized, and then deployed as a workload on my Kubernetes cluster, which is described on the [Kubernetes Homelab](/projects/kubernetes-homelab/) page. Production and staging run as distinct deployments, which makes it possible to test changes against the live environment before promoting them.
