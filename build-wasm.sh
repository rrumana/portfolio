#!/bin/bash

# Build WASM with optimizations and place in correct directory
echo "Building WASM Game of Life module..."

cd wasm_game_of_life

# Build with wasm-pack using release profile and web target
wasm-pack build --target web --release

# Copy generated files to static/wasm directory
echo "Copying WASM files to static/wasm..."
cp pkg/wasm_game_of_life.js ../static/wasm/
cp pkg/wasm_game_of_life_bg.wasm ../static/wasm/

echo "WASM build complete! Files copied to static/wasm/"