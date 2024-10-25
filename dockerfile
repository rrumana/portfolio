FROM rust:latest AS builder
RUN rustup target add x86_64-unknown-linux-musl

# Stage 1: Builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY static ./static
RUN cargo build --release --target x86_64-unknown-linux-musl

# Stage 2: Runtime
FROM alpine:latest
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/portfolio .
COPY --from=builder /app/static ./static
RUN chmod +x ./portfolio

EXPOSE 8085

CMD ["./portfolio"]
