---
title: "Rust Password Manager"
summary: "Self-hosted credential vault that follows NIST SP 800-63 guidance, leans on Rust safety, and experiments with WebAuthn flows."
featured: true
order: 7
techStack:
  - Rust
  - Axum
  - PostgreSQL
  - Argon2
  - WebAuthn
heroImage: "/images/password.png"
heroAlt: "Password manager interface concept"
primaryAction:
  label: "Project page"
  href: "/projects/rust-password-manager"
secondaryAction:
  label: "View repository"
  href: "https://github.com/rrumana/password-manager"
---
## Project goals
I wanted to explore what it would take to build a trustworthy password manager from the ground up. That meant leaning on Rust's safety guarantees while following the guidance from NIST SP 800-63 for credential storage, MFA flows, and recovery paths.

## Architecture sketch
- Axum API layers enforce rate limits, session handling, and structured auditing.
- Credentials are wrapped in envelope encryption, using Argon2id for key derivation and per-record nonces for defense in depth.
- PostgreSQL stores encrypted blobs alongside metadata so revocation, rotation, and device sync stay manageable.

## Current status
The project is still in motion: I'm integrating WebAuthn support and threat-modeling the recovery voice. Even unfinished, the repo documents the cryptographic decisions and lays the groundwork for a fully self-hosted deployment.

## Inspiration
This effort draws heavily from the [Bitwarden security whitepaper](https://bitwarden.com/help/bitwarden-security-white-paper/),
which outlines threat models, encryption design, and operational processes for a mature credential
platform.
