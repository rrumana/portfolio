# Repository Guidelines

## Command Restrictions
- Default to read-only operations; edit only the files tied to the task.
- Skip destructive commands (`git *`, `rm`, `mv`, `chmod`, etc.) unless the maintainer explicitly approves them.
- When unsure whether a command mutates repo state, pause and ask first.

## Project Structure & Module Organization
- `backend/`: Axum server, handlers in `src/`, integration suites under `tests/`.
- `wasm_game_of_life/`: shared WebAssembly engine for the Game of Life demo and solver.
- `frontend/`: Astro app with routes in `src/pages/`, UI primitives in `src/components/`, shared shells in `src/layouts/`.
- `static/`: published assets (`static/wasm/` from the WASM build, `static/dist/` from Astro, legacy HTML/CSS).
- Docker assets (`Dockerfile`, `docker-compose.yml`) bundle the backend binary plus static output.

## Build, Test, and Development Commands
- `cargo check` for quick validation; `cargo run -p backend --bin portfolio` to serve APIs and assets.
- `cargo test` or `cargo test -p backend` for unit and integration coverage.
- `cd wasm_game_of_life && wasm-pack build --target web --out-dir ../static/wasm` refreshes the browser bundle.
- `cd frontend && npm install && npm run dev` previews Astro; `npm run build` emits production HTML to `static/dist/`.
- `docker compose up --build` exercises the end-to-end container flow.

## Coding Style & Naming Conventions
- Run `cargo fmt` and `cargo clippy --all-targets --all-features` with zero warnings before submitting Rust changes.
- Keep crates/modules/files snake_case, public types UpperCamelCase, constants SCREAMING_SNAKE_CASE.
- Use PascalCase filenames for Astro components, semantic HTML, and co-located scoped styles when useful.
- Align new logger category prefixes with existing patterns in `log4rs.yaml`.

## Testing Guidelines
- Add backend integration tests in `backend/tests/` using `<feature>_test.rs` naming.
- Prefer deterministic fixtures; stash external data in `static/fixtures/` if needed.
- Extend Rust-side coverage for WASM logic and run `wasm-pack test --headless --chrome` when available.
- Keep `cargo test` green; gate optional suites behind feature flags.

## Commit & Pull Request Guidelines
- Follow the short, Title-Case commit subjects already in history; wrap body lines at ~72 characters.
- Group related changes per commit and reference issues with `Fixes #id` when relevant.
- PRs should outline scope, list validation commands (`cargo test`, `npm run build`, etc.), attach UI captures when helpful, and mention cross-repo impacts.
- Request review from maintainers tied to the affected area (`backend`, `wasm`, `frontend`) and wait for passing CI before merge.
