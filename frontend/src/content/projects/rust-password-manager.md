---
title: "Rust Password Manager"
summary: "An experimental Rust CLI for encrypted credential storage, master-password key derivation, and local vault management."
summaryShort: "Rust credential manager prototype focused on encrypted local storage and key derivation."
kind: "project"
status: "archive"
year: 2024
featured: false
featuredRank: 9
order: 7
role: "Rust learning-project author"
impact: "Explored local key derivation and encrypted persistence while exposing why security-sensitive prototypes require careful review."
audience: "technical"
techStack:
  - Rust
  - CLI
  - Argon2
  - HKDF
  - AES-256-GCM-SIV
  - SQLite
  - rusqlite
  - Serde
  - rpassword
heroImage: "/images/password.png"
heroAlt: "Password manager interface concept"
repoUrl: "https://github.com/rrumana/password-manager"
primaryAction:
  label: "View repository"
  href: "https://github.com/rrumana/password-manager"
---
## Overview
This project is a Rust CLI for storing credentials in an encrypted local vault. The current implementation covers account creation,
master-password login, per-user key derivation, and save/load flows around a SQLite-backed password store.

## Approach
Authentication starts with a master password. The application derives keys with Argon2 and HKDF, generates a symmetric vault key,
and encrypts the database payload with AES-256-GCM-SIV. The data model is intentionally small so the security boundaries remain visible.

## Status
This is an archived learning prototype, not a production password manager. The repository contains unresolved security and persistence issues and should not be used to store real credentials. It remains public because the implementation is useful context for discussing key management mistakes and the review standard security-sensitive software requires.
