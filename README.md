# Ryan Rumana Portfolio

Source for [rcrumana.xyz](https://rcrumana.xyz): an Astro 7 static frontend served by a small Rust/Axum runtime, with a Rust-to-WebAssembly Game of Life demonstration.

The current branch is the replacement frontend. It presents projects, complete and in-progress research, and long-form technical material through a restrained alpine editorial design. The site does not need visitor accounts, analytics, or public application APIs.

## Architecture

```text
frontend/             Astro 7 pages, content collections, components, and public assets
wasm_game_of_life/    Browser-side Rust/WASM demonstration
backend/              Axum static-file runtime and health/readiness probes
static/dist/          Generated Astro output; do not author content here
.github/workflows/    Validation and immutable staging-image publication
docs/                 Quality, privacy, and release guidance
```

`npm run build` in `frontend/` generates a static site in `static/dist/`. The container build compiles that output, the WASM bundle, and the Axum binary into one runtime image. Axum serves the generated files and exposes `/healthz` and `/readyz` for the platform.

The backend serves generated files, browser-local WASM, and the two platform probes. It does not issue visitor identifiers, ingest browser logs, or maintain shared Game-of-Life HTTP state.

## Content model

- Projects are case studies: what was built, the role, engineering decisions, impact, and current maintenance state.
- Research entries are technical records: authorship, date, abstract, scope, evidence, artifacts, and related projects.
- Research stage and availability are separate. Use **in-progress** or **complete** for the work, and **forthcoming** or **public** for availability.
- Making a report available on this site does not by itself make it an academic publication. Do not describe work as peer reviewed, accepted, or published by a venue unless that is factually true.

See [content authoring](frontend/docs/content-authoring.md) and the [design system](frontend/docs/design-system.md).

## Local development

Prerequisites are Node.js 24, npm, the Rust toolchain selected by `rust-toolchain.toml`, and the `wasm32-unknown-unknown` target. Docker is the most reproducible way to exercise the complete build.

Frontend development:

```bash
cd frontend
npm ci
npm run dev
```

Build the static frontend and run the Axum runtime:

```bash
cd frontend
npm run build
cd ..
cargo run -p backend --bin portfolio
```

Refresh the browser WASM bundle when its Rust source changes:

```bash
cd wasm_game_of_life
wasm-pack build --target web --out-dir ../frontend/public/wasm
```

The multi-stage container build pins the external Game-of-Life workspace revision used by the WASM and backend builds.

## Quality checks

Before a release, run the frontend type/build checks, Rust formatting/lint/tests, browser journeys, and axe accessibility assertions. The full command set and expected manual checks are in [docs/validation.md](docs/validation.md).

The minimum local checks are:

```bash
cd frontend
npm ci
npm audit --audit-level=high
npm run check
npm run build

cd ..
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --workspace
```

## Deployment

The site runs on a six-node kubeadm Kubernetes cluster with Rook/Ceph storage. That high-level description is sufficient for public documentation; node identities, network layout, credentials, internal endpoints, and recovery secrets do not belong in this repository.

The staging workflow validates the frontend, backend, and WASM targets, then pushes a uniquely tagged Harbor image and records its immutable digest. It does not mutate the cluster. Deployment is GitOps-driven: update the staging manifest to the digest, let Argo CD reconcile it, validate staging, then promote the exact same digest to production.

Staging must remain `noindex, nofollow`. Production cutover is blocked until the candidate passes staging accessibility, privacy, browser, and security QA and a known-good rollback digest is recorded. See the [release and rollback runbook](docs/release-runbook.md).

## Privacy and security

The intended production posture is deliberately simple: no visitor tracking, analytics identifiers, fingerprinting, advertising pixels, or server-issued client IDs. A local theme preference is acceptable when it is not transmitted or used as an identifier. Operational logging must be minimized and short-lived.

The implementation and release criteria are documented in [docs/security-privacy.md](docs/security-privacy.md).

## Documentation

- [Frontend guide](frontend/README.md)
- [Content authoring](frontend/docs/content-authoring.md)
- [Alpine editorial design system](frontend/docs/design-system.md)
- [Security and privacy](docs/security-privacy.md)
- [Validation and QA](docs/validation.md)
- [Staging, production, and rollback](docs/release-runbook.md)

## License

The repository is licensed under the [MIT License](LICENSE). Research documents and third-party assets may carry separate terms; do not infer that the repository license changes their rights.
