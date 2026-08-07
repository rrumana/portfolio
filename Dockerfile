# syntax=docker/dockerfile:1.6

########################################
# Frontend build stage
########################################
FROM node:24-bookworm-slim AS frontend-builder
WORKDIR /workspace
ENV ASTRO_TELEMETRY_DISABLED=1

# Install frontend dependencies and build the Astro site
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm ci --prefix frontend
COPY frontend ./frontend
RUN mkdir -p static && npm run build --prefix frontend

########################################
# WASM build stage
########################################
# Bootstrap rustup from a stable, versioned image; rust-toolchain.toml selects
# the exact nightly compiler used by the project.
FROM rust:1.97.1-bookworm AS wasm-builder
WORKDIR /workspace

ARG GAME_OF_LIFE_REVISION=4deae6884398138b85536465911d4a22a83c29a6
ARG WASM_PACK_VERSION=0.15.0

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl git pkg-config libssl-dev \
    && rm -rf /var/lib/apt/lists/*

COPY rust-toolchain.toml ./
RUN rustup target add wasm32-unknown-unknown \
    && rustup component add rust-src
RUN cargo install wasm-pack --version "${WASM_PACK_VERSION}" --locked

COPY Cargo.toml Cargo.lock ./
COPY backend ./backend
COPY wasm_game_of_life ./wasm_game_of_life

# Fetch the consolidated proof workspace at an immutable revision.
RUN git clone https://github.com/rrumana/Reverse_Game_Of_Life.git game_of_life \
    && git -C game_of_life checkout --detach "${GAME_OF_LIFE_REVISION}"

# Patch path dependencies so they resolve inside the build context
RUN sed -i 's|../../game_of_life|../game_of_life|g' wasm_game_of_life/Cargo.toml

RUN wasm-pack build \
    --target web \
    --release \
    --out-dir /workspace/wasm-pkg \
    --out-name wasm_game_of_life \
    ./wasm_game_of_life \
    --locked

########################################
# Backend build stage
########################################
FROM rust:1.97.1-bookworm AS backend-builder
WORKDIR /workspace

ARG GAME_OF_LIFE_REVISION=4deae6884398138b85536465911d4a22a83c29a6

RUN apt-get update \
    && apt-get install -y --no-install-recommends musl-tools pkg-config libssl-dev git \
    && rm -rf /var/lib/apt/lists/*

COPY rust-toolchain.toml ./
RUN rustup target add x86_64-unknown-linux-musl

COPY Cargo.toml Cargo.lock ./
COPY backend ./backend
COPY wasm_game_of_life ./wasm_game_of_life
COPY log4rs.yaml ./log4rs.yaml

# Fetch the external workspace required by the WASM workspace member.
RUN git clone https://github.com/rrumana/Reverse_Game_Of_Life.git game_of_life \
    && git -C game_of_life checkout --detach "${GAME_OF_LIFE_REVISION}"

RUN sed -i 's|../../game_of_life|../game_of_life|g' wasm_game_of_life/Cargo.toml

RUN cargo fetch --locked
RUN cargo build --release --locked --target x86_64-unknown-linux-musl -p backend

########################################
# Runtime image
########################################
FROM scratch AS runtime

WORKDIR /app

COPY --from=backend-builder /workspace/target/x86_64-unknown-linux-musl/release/portfolio ./portfolio
COPY --from=backend-builder /workspace/log4rs.yaml ./log4rs.yaml
COPY --from=frontend-builder /workspace/static/dist ./static/dist
COPY --from=wasm-builder /workspace/wasm-pkg ./static/wasm

ARG APP_PORT=8085
ENV APP_PORT=${APP_PORT}
ENV PORT=${APP_PORT}
ENV RUST_LOG=info

EXPOSE ${APP_PORT}
USER 10001:10001
CMD ["./portfolio"]
