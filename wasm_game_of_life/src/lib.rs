use wasm_bindgen::prelude::*;
use rayon::prelude::*;
use log::info;
use console_log;

pub const WIDTH: usize = 20;
pub const HEIGHT: usize = 20;

#[wasm_bindgen]
pub fn init_logging() {
    console_log::init_with_level(log::Level::Info).expect("Failed to initialize console_log");
    info!("WASM logging initialized");
}

#[wasm_bindgen]
pub fn index(row: usize, col: usize) -> usize {
    row * WIDTH + col
}

#[wasm_bindgen]
pub fn count_neighbors(grid: &[u8], row: usize, col: usize) -> u8 {
    let mut count = 0;
    for dr in [-1, 0, 1].iter() {
        for dc in [-1, 0, 1].iter() {
            if *dr == 0 && *dc == 0 { continue; }
            let r = row as isize + dr;
            let c = col as isize + dc;
            if r >= 0 && r < HEIGHT as isize && c >= 0 && c < WIDTH as isize {
                count += grid[index(r as usize, c as usize)];
            }
        }
    }
    info!("Cell ({}, {}) has {} neighbors", row, col, count);
    count
}

#[wasm_bindgen]
pub fn tick(current: &[u8]) -> Vec<u8> {
    info!("Starting tick simulation");
    let mut next = vec![0; WIDTH * HEIGHT];
    next.par_chunks_mut(WIDTH)
        .into_par_iter()
        .enumerate()
        .for_each(|(row, row_slice)| {
            for col in 0..WIDTH {
                let idx = index(row, col);
                let neighbors = count_neighbors(current, row, col);
                row_slice[col] = match (current[idx], neighbors) {
                    (1, 2) | (1, 3) | (0, 3) => 1,
                    _ => 0,
                };
            }
        });
    info!("Tick simulation complete");
    next
}

/// Returns a sample grid with a glider pattern.
#[wasm_bindgen]
pub fn sample_grid() -> Vec<u8> {
    let mut grid = vec![0; WIDTH * HEIGHT];
    // Create a glider pattern:
    // Coordinates for a glider relative to the top-left:
    // (1,0), (2,1), (0,2), (1,2), (2,2)
    grid[index(1, 0)] = 1;
    grid[index(2, 1)] = 1;
    grid[index(0, 2)] = 1;
    grid[index(1, 2)] = 1;
    grid[index(2, 2)] = 1;
    info!("Returning a sample grid with a glider pattern");
    grid
}
