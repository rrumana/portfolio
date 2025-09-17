# syntax=docker/dockerfile:1.6

########################################
# Frontend build stage
########################################
FROM node:20-bullseye-slim AS frontend-builder
WORKDIR /workspace

# Install frontend dependencies and build the Astro site
COPY frontend/package.json ./frontend/package.json
RUN npm install --prefix frontend
COPY frontend ./frontend
RUN mkdir -p static && npm run build --prefix frontend

########################################
# WASM build stage
########################################
FROM rust:1.80-bullseye AS wasm-builder
WORKDIR /workspace

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl git pkg-config libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN rustup target add wasm32-unknown-unknown
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

COPY Cargo.toml Cargo.lock ./
COPY wasm_game_of_life ./wasm_game_of_life

# Clone external dependencies required by the wasm crate
RUN git clone https://github.com/rrumana/game_of_life.git
RUN git clone https://github.com/rrumana/text_to_input.git

# Patch path dependencies so they resolve inside the build context
RUN sed -i 's|../../game_of_life|../game_of_life|g' wasm_game_of_life/Cargo.toml \
    && sed -i 's|../../text_to_input|../text_to_input|g' wasm_game_of_life/Cargo.toml

RUN wasm-pack build ./wasm_game_of_life \
    --target web \
    --release \
    --out-dir /workspace/wasm-pkg \
    --out-name wasm_game_of_life

########################################
# Backend build stage
########################################
FROM rust:1.80-bullseye AS backend-builder
WORKDIR /workspace

RUN apt-get update \
    && apt-get install -y --no-install-recommends musl-tools pkg-config libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN rustup target add x86_64-unknown-linux-musl

COPY Cargo.toml Cargo.lock ./
COPY backend ./backend
COPY log4rs.yaml ./log4rs.yaml

RUN cargo fetch --locked
RUN cargo build --release --target x86_64-unknown-linux-musl -p backend

########################################
# Runtime image
########################################
FROM debian:bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=backend-builder /workspace/target/x86_64-unknown-linux-musl/release/portfolio ./portfolio
COPY --from=backend-builder /workspace/log4rs.yaml ./log4rs.yaml
COPY --from=frontend-builder /workspace/static/dist ./static/dist
COPY --from=wasm-builder /workspace/wasm-pkg ./static/wasm

EXPOSE 8086
ENV RUST_LOG=info

CMD ["./portfolio"]
