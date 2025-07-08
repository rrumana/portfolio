# Portfolio Website

A high-performance, self-hosted portfolio website built entirely in Rust, showcasing advanced systems programming, web development, and computational problem-solving capabilities.

## 🚀 Overview

This portfolio represents a comprehensive demonstration of modern Rust development across multiple domains:

- **Web Backend**: High-performance Axum-based server with custom middleware
- **WebAssembly Integration**: Rust-compiled WASM for browser-based Game of Life simulation
- **Advanced Algorithms**: SAT-based reverse Game of Life solver using constraint programming
- **Systems Programming**: Custom SAT solver bindings and optimized cellular automaton engines
- **DevOps**: Containerized deployment with multi-stage Docker builds
- **Frontend**: Responsive design with SCSS compilation and minimal JavaScript

## 🏗️ Architecture

### Project Structure

```
portfolio/
├── backend/           # Axum web server
├── wasm_game_of_life/ # WebAssembly Game of Life engine
├── static/            # Frontend assets (HTML, CSS, JS)
└── Dockerfile         # Multi-stage containerized build

External Dependencies:
├── game_of_life/      # Core cellular automaton engine with SIMD optimizations
├── game_of_life_reverse/ # SAT-based reverse solver
├── text_to_input/     # ASCII art to cellular pattern converter
└── parkissat-sys/     # Custom Rust bindings for ParKissat SAT solver
```

### Core Components

#### 1. **Web Backend** ([`backend/`](backend/))
- **Framework**: [Axum](https://github.com/tokio-rs/axum) for high-performance async web serving
- **Features**: 
  - Static file serving with custom middleware
  - RESTful API endpoints for Game of Life simulation
  - Request logging and error handling
  - Sitemap generation

#### 2. **WebAssembly Engine** ([`wasm_game_of_life/`](wasm_game_of_life/))
- **Purpose**: Browser-based Game of Life simulation with near-native performance
- **Features**:
  - SIMD-optimized cellular automaton engine compiled to WASM
  - Interactive grid manipulation and pattern loading
  - Text-to-pattern conversion using ASCII art
  - Real-time simulation with configurable speed
- **Build Target**: `wasm32-unknown-unknown` with [`wasm-pack`](https://rustwasm.github.io/wasm-pack/)

#### 3. **Game of Life Engine** ([`game_of_life/`](../game_of_life/))
- **Multiple Engine Implementations**:
  - **Naive Engine**: Basic implementation for reference
  - **SIMD Engine**: Vectorized operations using portable SIMD
  - **Ultimate Engine**: Highly optimized with multiple boundary conditions
- **Features**:
  - Support for dead, wrap, and mirror boundary conditions
  - Comprehensive benchmarking suite
  - Pattern I/O with multiple formats
  - Grid resizing and state management

#### 4. **Reverse Game of Life Solver** ([`game_of_life_reverse/`](../game_of_life_reverse/))
- **Problem**: NP-Complete reverse cellular automaton solving
- **Approach**: Boolean Satisfiability (SAT) problem reduction
- **SAT Solvers**: 
  - [CaDiCaL](https://github.com/arminbiere/cadical) for single-threaded solving
  - [ParKissat-RS](https://github.com/shaowei-cai-group/ParKissat-RS) for parallel solving
- **Features**:
  - Multi-generation predecessor finding
  - Solution validation and analysis
  - Configurable optimization levels
  - Pattern recognition and quality analysis

#### 5. **Custom SAT Solver Bindings** ([`parkissat-sys/`](../parkissat-sys/))
- **Purpose**: Safe Rust bindings for ParKissat-RS SAT solver
- **Implementation**: FFI bindings with [`bindgen`](https://rust-lang.github.io/rust-bindgen/) and [`cc`](https://github.com/rust-lang/cc-rs)
- **Features**: Memory-safe wrapper around C++ SAT solver

#### 6. **Text Processing Utilities** ([`text_to_input/`](../text_to_input/))
- **Purpose**: Convert text strings to Game of Life patterns
- **Implementation**: It's a Hashmap...
- **Integration**: Used by both WASM frontend and reverse solver

## 🛠️ Technical Features

### Performance Optimizations

- **SIMD Vectorization**: Portable SIMD for cross-platform performance
- **Memory Layout**: Cache-friendly data structures for cellular automaton simulation
- **WebAssembly**: Near-native performance in browsers
- **Parallel SAT Solving**: Multi-threaded constraint satisfaction
- **Link-Time Optimization**: Aggressive compiler optimizations for release builds

## 🚀 Deployment

### Docker Containerization

The project uses a multi-stage Docker build:

```dockerfile
# Stage 1: Rust compilation with multiple targets
FROM rust:latest AS builder
RUN rustup target add x86_64-unknown-linux-musl wasm32-unknown-unknown

# Stage 2: Minimal Alpine runtime
FROM alpine:latest
RUN apk add --no-cache ca-certificates
```

**Features**:
- Multi-target compilation (native + WASM)
- Static linking for minimal runtime dependencies
- Optimized binary size with `musl` target
- Automatic dependency cloning from GitHub

### Self-Hosted Infrastructure

- **Platform**: Arch Linux on AMD Ryzen 12-core mini-PC
- **Storage**: BTRFS RAID 1 with automated snapshots
- **Networking**: OPNsense firewall with Cloudflare integration
- **Monitoring**: Custom dashboard with system metrics
- **Security**: WireGuard VPN for remote access

## 🏃‍♂️ Quick Start

### Prerequisites

- Rust 1.70+ with nightly toolchain
- Node.js (for WASM tooling)
- Docker (for containerized deployment)

### Local Development

```bash
# Clone the repository
git clone https://github.com/rrumana/portfolio.git
cd portfolio

# Install required targets
rustup target add wasm32-unknown-unknown

# Build the project
cargo build --release

# Run the development server
cargo run --bin portfolio
```

### Docker Deployment

```bash
# Build the container
docker build -t portfolio .

# Run with port mapping
docker run -p 8085:8085 portfolio
```

### WASM Development

```bash
cd wasm_game_of_life
wasm-pack build --target web --out-dir ../static/wasm
```

## 🧪 Testing

```bash
# Run all tests
cargo test

# Run with output
cargo test -- --nocapture

# Test specific components
cargo test --package backend
cargo test --package wasm_game_of_life
```

## 🔧 Configuration

### Build Profiles

```toml
[profile.release]
opt-level = "s"        # Optimize for size
lto = true            # Link-time optimization
debug = false         # Strip debug info
panic = "abort"       # Smaller binary size
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

### Portfolio Project License

This portfolio project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Third-Party Dependencies

This project incorporates several third-party libraries and tools, each with their own licensing terms.

## 🙏 Acknowledgments

- **John Conway** - Creator of Conway's Game of Life
- **SAT Solving Community** - For efficient constraint satisfaction algorithms
- **Rust Community** - For exceptional tooling and ecosystem
- **WebAssembly Working Group** - For enabling high-performance web applications

## 📚 Related Projects

- [Game of Life Engine](https://github.com/rrumana/game_of_life) - Core cellular automaton implementation
- [Reverse Game of Life](https://github.com/rrumana/game_of_life_reverse) - SAT-based predecessor finding
- [ParKissat-RS Bindings](https://github.com/rrumana/parkissat-sys) - Custom SAT solver integration
- [Rust Lecture Series](https://github.com/rrumana/rust_lecture) - Educational Rust content

## 🌐 Live Demo

Visit the live portfolio at [https://rcrumana.xyz](https://rcrumana.xyz) to see the project in action, including the interactive Game of Life simulation powered by WebAssembly.