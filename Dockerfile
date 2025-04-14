FROM rust:latest AS builder
RUN rustup target add x86_64-unknown-linux-musl wasm32-unknown-unknown 

WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY backend ./backend
COPY wasm_game_of_life ./wasm_game_of_life
COPY static ./static
COPY log4rs.yaml .
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
