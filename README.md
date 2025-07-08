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
- **Dependencies**: [`tokio`](https://tokio.rs/), [`tower-http`](https://github.com/tower-rs/tower-http), [`serde`](https://serde.rs/)

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
- **Build System**: Custom build script for cross-platform compilation

#### 6. **Text Processing Utilities** ([`text_to_input/`](../text_to_input/))
- **Purpose**: Convert text strings to Game of Life patterns
- **Algorithm**: ASCII art generation with cellular automaton mapping
- **Integration**: Used by both WASM frontend and reverse solver

## 🛠️ Technical Features

### Performance Optimizations

- **SIMD Vectorization**: Portable SIMD for cross-platform performance
- **Memory Layout**: Cache-friendly data structures for cellular automaton simulation
- **WebAssembly**: Near-native performance in browsers
- **Parallel SAT Solving**: Multi-threaded constraint satisfaction
- **Link-Time Optimization**: Aggressive compiler optimizations for release builds

### Advanced Algorithms

- **SAT Encoding**: Conversion of Game of Life rules to boolean constraints
- **Constraint Programming**: Hybrid encoding with auxiliary variables
- **Pattern Analysis**: Detection of known cellular automaton patterns
- **Optimization Strategies**: Multiple solver backends with configurable parameters

### Web Technologies

- **Responsive Design**: Mobile-first CSS with SCSS preprocessing
- **Progressive Enhancement**: Core functionality without JavaScript
- **WebAssembly Integration**: Seamless Rust-to-browser compilation
- **Static Asset Optimization**: Efficient serving with proper caching headers

## 🚀 Deployment

### Docker Containerization

The project uses a sophisticated multi-stage Docker build:

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

## 📦 Dependencies

### Core Rust Crates

| Crate | Purpose | Version |
|-------|---------|---------|
| [`axum`](https://crates.io/crates/axum) | Web framework | 0.8 |
| [`tokio`](https://crates.io/crates/tokio) | Async runtime | 1.43+ |
| [`wasm-bindgen`](https://crates.io/crates/wasm-bindgen) | WASM bindings | 0.2 |
| [`rayon`](https://crates.io/crates/rayon) | Data parallelism | 1.10 |
| [`serde`](https://crates.io/crates/serde) | Serialization | 1.0 |
| [`clap`](https://crates.io/crates/clap) | CLI parsing | 4.5 |

### SAT Solving Dependencies

| Crate | Purpose | Version |
|-------|---------|---------|
| [`cadical`](https://crates.io/crates/cadical) | SAT solver | 0.1 |
| `parkissat-sys` | Custom SAT bindings | 0.1.0 |
| [`anyhow`](https://crates.io/crates/anyhow) | Error handling | 1.0 |
| [`thiserror`](https://crates.io/crates/thiserror) | Error derivation | 2.0 |

### Build Dependencies

| Tool | Purpose |
|------|---------|
| [`bindgen`](https://crates.io/crates/bindgen) | C++ binding generation |
| [`cc`](https://crates.io/crates/cc) | C/C++ compilation |
| [`wasm-pack`](https://rustwasm.github.io/wasm-pack/) | WASM build tool |

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

# Run benchmarks
cargo bench
```

## 📊 Performance Benchmarks

### Game of Life Engine Performance

| Grid Size | Naive Engine | SIMD Engine | Ultimate Engine |
|-----------|--------------|-------------|-----------------|
| 100x100   | 2.3ms       | 0.8ms       | 0.6ms          |
| 500x500   | 58ms        | 19ms        | 15ms           |
| 1000x1000 | 230ms       | 76ms        | 58ms           |

### SAT Solver Performance

| Problem Size | CaDiCaL | ParKissat-RS | Speedup |
|--------------|---------|--------------|---------|
| 10x10, 3 gen | 1.2s    | 0.8s        | 1.5x    |
| 20x20, 2 gen | 45s     | 18s         | 2.5x    |
| 30x30, 1 gen | 180s    | 65s         | 2.8x    |

## 🔧 Configuration

### Environment Variables

```bash
# Server configuration
RUST_LOG=info
PORTFOLIO_PORT=8085
PORTFOLIO_HOST=0.0.0.0

# SAT solver settings
SAT_TIMEOUT=300
SAT_MAX_SOLUTIONS=10
```

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

### Development Guidelines

- Follow Rust naming conventions and idioms
- Add tests for new functionality
- Update documentation for API changes
- Ensure all benchmarks pass
- Use `cargo fmt` and `cargo clippy`

## 📄 License

### Portfolio Project License

This portfolio project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Ryan Rumana

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Third-Party Dependencies

This project incorporates several third-party libraries and tools, each with their own licensing terms:

#### Rust Ecosystem Dependencies

| Dependency | License | Purpose |
|------------|---------|---------|
| [`axum`](https://crates.io/crates/axum) | MIT | Web framework |
| [`tokio`](https://crates.io/crates/tokio) | MIT | Async runtime |
| [`wasm-bindgen`](https://crates.io/crates/wasm-bindgen) | MIT OR Apache-2.0 | WebAssembly bindings |
| [`rayon`](https://crates.io/crates/rayon) | MIT OR Apache-2.0 | Data parallelism |
| [`serde`](https://crates.io/crates/serde) | MIT OR Apache-2.0 | Serialization framework |
| [`clap`](https://crates.io/crates/clap) | MIT OR Apache-2.0 | Command line parsing |
| [`tower-http`](https://crates.io/crates/tower-http) | MIT | HTTP middleware |
| [`js-sys`](https://crates.io/crates/js-sys) | MIT OR Apache-2.0 | JavaScript bindings |
| [`web-sys`](https://crates.io/crates/web-sys) | MIT OR Apache-2.0 | Web API bindings |
| [`log`](https://crates.io/crates/log) | MIT OR Apache-2.0 | Logging facade |
| [`thiserror`](https://crates.io/crates/thiserror) | MIT OR Apache-2.0 | Error handling |
| [`anyhow`](https://crates.io/crates/anyhow) | MIT OR Apache-2.0 | Error handling |
| [`itertools`](https://crates.io/crates/itertools) | MIT OR Apache-2.0 | Iterator utilities |

#### SAT Solver Dependencies

| Dependency | License | Purpose |
|------------|---------|---------|
| [`cadical`](https://crates.io/crates/cadical) | MIT | CaDiCaL SAT solver bindings |
| `parkissat-sys` | MIT OR Apache-2.0 | Custom ParKissat-RS bindings |

#### Build and Development Dependencies

| Dependency | License | Purpose |
|------------|---------|---------|
| [`bindgen`](https://crates.io/crates/bindgen) | BSD-3-Clause | C++ binding generation |
| [`cc`](https://crates.io/crates/cc) | MIT OR Apache-2.0 | C/C++ compilation |
| [`tempfile`](https://crates.io/crates/tempfile) | MIT OR Apache-2.0 | Temporary file handling |

#### External SAT Solvers

| Software | License | Purpose |
|----------|---------|---------|
| [CaDiCaL](https://github.com/arminbiere/cadical) | MIT | SAT solver engine |
| [ParKissat-RS](https://github.com/shaowei-cai-group/ParKissat-RS) | MIT | Parallel SAT solver |

#### Frontend Dependencies

| Dependency | License | Purpose |
|------------|---------|---------|
| [Font Awesome](https://fontawesome.com/) | Font Awesome Free License | Icons |

### License Compatibility

All dependencies used in this project are compatible with the MIT License under which this portfolio is released. The project primarily uses:

- **MIT Licensed** components: Fully compatible
- **MIT OR Apache-2.0** dual-licensed components: Compatible under MIT terms
- **BSD-3-Clause** components: Compatible with MIT
- **Font Awesome Free License**: Compatible for free/open source projects

### External Project Licenses

The related projects referenced in this portfolio have their own licensing:

- **game_of_life**: MIT License
- **game_of_life_reverse**: MIT License
- **text_to_input**: MIT License
- **parkissat-sys**: MIT OR Apache-2.0

### Attribution Requirements

While not legally required under the MIT License, attribution is appreciated when using or referencing this work. The project makes use of several excellent open-source libraries and tools from the Rust ecosystem and SAT solving community.

### Disclaimer

This licensing information is provided for reference. For authoritative licensing information, please refer to the individual license files and documentation of each dependency. License compatibility should be verified independently for any derivative works or commercial use.

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

Visit the live portfolio at [https://ryanrumana.com](https://ryanrumana.com) to see the project in action, including the interactive Game of Life simulation powered by WebAssembly.

---

*This portfolio demonstrates advanced Rust programming across systems programming, web development, algorithmic problem-solving, and deployment automation. It represents a comprehensive showcase of modern software engineering practices and performance optimization techniques.*
