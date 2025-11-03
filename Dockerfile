# syntax=docker/dockerfile:1.6

########################################
# Frontend build stage
########################################
FROM node:20-bullseye-slim AS frontend-builder
WORKDIR /workspace

# Install git and SSH client for dependencies fetched via npm
RUN apt-get update \
    && apt-get install -y --no-install-recommends git openssh-client ca-certificates \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Force git-based installs to use HTTPS to avoid SSH key requirements
RUN git config --global url."https://github.com/".insteadOf git@github.com: \
    && git config --global url."https://github.com/".insteadOf ssh://git@github.com/

# Install frontend dependencies and build the Astro site
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm ci --prefix frontend
COPY frontend ./frontend
RUN mkdir -p static && npm run build --prefix frontend

########################################
# WASM build stage
########################################
# use nightly rust for edition 2024 support
FROM rustlang/rust:nightly-bullseye AS wasm-builder
WORKDIR /workspace

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl git pkg-config libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN rustup target add wasm32-unknown-unknown
RUN rustup component add rust-src
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

COPY Cargo.toml Cargo.lock ./
COPY backend ./backend
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
# use nightly rust for edition 2024 support in backend crate
FROM rustlang/rust:nightly-bullseye AS backend-builder
WORKDIR /workspace

RUN apt-get update \
    && apt-get install -y --no-install-recommends musl-tools pkg-config libssl-dev git \
    && rm -rf /var/lib/apt/lists/*

RUN rustup target add x86_64-unknown-linux-musl

COPY Cargo.toml Cargo.lock ./
COPY backend ./backend
COPY wasm_game_of_life ./wasm_game_of_life
COPY log4rs.yaml ./log4rs.yaml

# Fetch external dependencies required by the wasm workspace member
RUN git clone https://github.com/rrumana/game_of_life.git \
    && git clone https://github.com/rrumana/text_to_input.git

RUN sed -i 's|../../game_of_life|../game_of_life|g' wasm_game_of_life/Cargo.toml \
    && sed -i 's|../../text_to_input|../text_to_input|g' wasm_game_of_life/Cargo.toml

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

ARG APP_PORT=8085
ENV APP_PORT=${APP_PORT}
ENV PORT=${APP_PORT}
ENV RUST_LOG=info

EXPOSE ${APP_PORT}
CMD ["./portfolio"]
