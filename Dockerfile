FROM rust:latest AS builder
RUN rustup default nightly
RUN rustup component add rust-src
RUN rustup target add x86_64-unknown-linux-musl wasm32-unknown-unknown

# Install git and musl tools for cloning dependencies and cross-compilation
RUN apt-get update && apt-get install -y git musl-tools && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Clone the external dependencies from GitHub
RUN git clone https://github.com/rrumana/game_of_life.git
RUN git clone https://github.com/rrumana/text_to_input.git

# Copy portfolio project files
COPY Cargo.toml Cargo.lock ./
COPY backend ./backend
COPY wasm_game_of_life ./wasm_game_of_life
COPY static ./static
COPY log4rs.yaml .

# Update the wasm_game_of_life Cargo.toml to use the correct paths for Docker build
RUN sed -i 's|path = "../../game_of_life"|path = "../game_of_life"|g' wasm_game_of_life/Cargo.toml
RUN sed -i 's|path = "../../text_to_input"|path = "../text_to_input"|g' wasm_game_of_life/Cargo.toml

RUN cargo fetch --locked
RUN cargo build --release --target x86_64-unknown-linux-musl -p backend

# Build the WASM module
WORKDIR /app/wasm_game_of_life
RUN cargo build --release --target wasm32-unknown-unknown

# Copy the WASM artifact into the static assets folder.
# Adjust the artifact name if your crate builds with a different binary name.
WORKDIR /app
RUN mkdir -p static/wasm && \
    cp target/wasm32-unknown-unknown/release/wasm_game_of_life.wasm static/wasm/

FROM alpine:latest
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/portfolio .
COPY --from=builder /app/static ./static
COPY --from=builder /app/log4rs.yaml .
RUN chmod +x ./portfolio

EXPOSE 8085

CMD ["./portfolio"]
