use game_of_life::engines::{GameOfLifeEngine, UltimateEngine};
use game_of_life::grid::{Grid, StandardGrid};
use gif::{Encoder, Frame, Repeat};
use js_sys::{Array, Function};
use log::Level;
use serde::Serialize;
use std::cell::RefCell;
use text_to_input::text_to_pixel_art;
use wasm_bindgen::prelude::*;
use web_sys::console;

// Default grid dimensions for backward compatibility
const DEFAULT_WIDTH: usize = 20;
const DEFAULT_HEIGHT: usize = 20;

thread_local! {
    static JS_LOGGER: RefCell<Option<Function>> = RefCell::new(None);
}

fn forward_log(level: Level, message: &str) {
    JS_LOGGER.with(|logger| {
        if let Some(callback) = logger.borrow().as_ref() {
            let _ = callback.call2(
                &JsValue::NULL,
                &JsValue::from_str(level.as_str()),
                &JsValue::from_str(message),
            );
        }
    });
}

fn log_with_level(level: Level, message: String) {
    log::log!(level, "{}", message);
    forward_log(level, &message);
}

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn init_logging() {
    console_log::init_with_level(log::Level::Info).expect("Failed to initialize console_log");
    log_with_level(
        Level::Info,
        "WASM logging initialized with UltimateEngine".to_string(),
    );
}

#[wasm_bindgen]
pub fn set_log_hook(callback: Function) {
    JS_LOGGER.with(|logger| {
        *logger.borrow_mut() = Some(callback);
    });
}

/// Game of Life WASM wrapper that maintains compatibility with existing interface
#[wasm_bindgen]
pub struct GameOfLifeWasm {
    engine: UltimateEngine<4>,
    width: usize,
    height: usize,
}

#[wasm_bindgen]
impl GameOfLifeWasm {
    #[wasm_bindgen(constructor)]
    pub fn new(width: usize, height: usize) -> GameOfLifeWasm {
        let engine = UltimateEngine::new(width, height);
        log_with_level(
            Level::Info,
            format!(
                "Created new GameOfLifeWasm with dimensions {}x{}",
                width, height
            ),
        );
        GameOfLifeWasm {
            engine,
            width,
            height,
        }
    }

    /// Get the current grid state as a flat array
    #[wasm_bindgen]
    pub fn get_state(&self) -> Vec<u8> {
        let mut state = vec![0u8; self.width * self.height];
        for row in 0..self.height {
            for col in 0..self.width {
                let idx = row * self.width + col;
                state[idx] = if self.engine.get_cell(row, col) { 1 } else { 0 };
            }
        }
        state
    }

    /// Step the simulation forward one generation
    #[wasm_bindgen]
    pub fn step(&mut self) {
        self.engine.step();
    }

    /// Set a cell at the given row and column
    #[wasm_bindgen]
    pub fn set_cell(&mut self, row: usize, col: usize, alive: bool) {
        if row < self.height && col < self.width {
            // Create a new grid with the updated cell
            let mut grid = StandardGrid::new(self.width, self.height);

            // Copy current state
            for r in 0..self.height {
                for c in 0..self.width {
                    grid.set_cell(r, c, self.engine.get_cell(r, c));
                }
            }

            // Set the new cell
            grid.set_cell(row, col, alive);

            // Update the engine
            self.engine.set_grid(&grid);
        }
    }

    /// Get a cell at the given row and column
    #[wasm_bindgen]
    pub fn get_cell(&self, row: usize, col: usize) -> bool {
        if row < self.height && col < self.width {
            self.engine.get_cell(row, col)
        } else {
            false
        }
    }

    /// Toggle a cell at the given row and column
    #[wasm_bindgen]
    pub fn toggle_cell(&mut self, row: usize, col: usize) {
        let current = self.get_cell(row, col);
        self.set_cell(row, col, !current);
    }

    /// Clear the grid
    #[wasm_bindgen]
    pub fn clear(&mut self) {
        let grid = StandardGrid::new(self.width, self.height);
        self.engine.set_grid(&grid);
    }

    /// Resize the grid to new dimensions
    #[wasm_bindgen]
    pub fn resize(&mut self, width: usize, height: usize) {
        self.engine = UltimateEngine::new(width, height);
        self.width = width;
        self.height = height;
        log_with_level(Level::Info, format!("Resized grid to {}x{}", width, height));
    }

    /// Load grid from a flat array
    #[wasm_bindgen]
    pub fn load_from_array(
        &mut self,
        data: &[u8],
        width: usize,
        height: usize,
    ) -> Result<(), JsValue> {
        if data.len() != width * height {
            return Err(JsValue::from_str("Data length doesn't match dimensions"));
        }

        // Resize if needed
        if width != self.width || height != self.height {
            self.resize(width, height);
        }

        // Create grid and load data
        let mut grid = StandardGrid::new(width, height);
        for row in 0..height {
            for col in 0..width {
                let idx = row * width + col;
                grid.set_cell(row, col, data[idx] != 0);
            }
        }

        self.engine.set_grid(&grid);
        log_with_level(
            Level::Info,
            format!(
                "Loaded grid from array with dimensions {}x{}",
                width, height
            ),
        );
        Ok(())
    }

    /// Get grid dimensions
    #[wasm_bindgen]
    pub fn get_dimensions(&self) -> Array {
        let result = Array::new();
        result.push(&JsValue::from(self.width));
        result.push(&JsValue::from(self.height));
        result
    }

    /// Count live cells
    #[wasm_bindgen]
    pub fn count_live_cells(&self) -> usize {
        self.engine.count_live_cells()
    }
}

/// GIF Recorder for capturing Game of Life animations
#[wasm_bindgen]
pub struct GifRecorder {
    buffer: Vec<u8>,
    frame_delay_ms: u16,
    width: u16,
    height: u16,
    is_recording: bool,
    frames: Vec<Vec<u8>>,
}

#[wasm_bindgen]
impl GifRecorder {
    #[wasm_bindgen(constructor)]
    pub fn new() -> GifRecorder {
        GifRecorder {
            buffer: Vec::new(),
            frame_delay_ms: 100,
            width: 0,
            height: 0,
            is_recording: false,
            frames: Vec::new(),
        }
    }

    /// Start recording with specified dimensions and frame delay
    #[wasm_bindgen]
    pub fn start_recording(
        &mut self,
        width: usize,
        height: usize,
        frame_delay_ms: u16,
    ) -> Result<(), JsValue> {
        if self.is_recording {
            return Err(JsValue::from_str("Already recording"));
        }

        self.width = width as u16;
        self.height = height as u16;
        self.frame_delay_ms = frame_delay_ms;
        self.buffer = Vec::new();
        self.frames = Vec::new();
        self.is_recording = true;

        log_with_level(
            Level::Info,
            format!(
                "Started GIF recording: {}x{} at {}ms per frame",
                width, height, frame_delay_ms
            ),
        );
        Ok(())
    }

    /// Add a frame to the GIF from RGB image data
    #[wasm_bindgen]
    pub fn capture_frame(&mut self, rgb_data: &[u8]) -> Result<(), JsValue> {
        if !self.is_recording {
            return Err(JsValue::from_str("Not currently recording"));
        }

        let expected_size = (self.width as usize) * (self.height as usize) * 3; // RGB = 3 bytes per pixel
        if rgb_data.len() != expected_size {
            return Err(JsValue::from_str(&format!(
                "RGB data size mismatch: expected {}x{}x3 = {}, got {}",
                self.width,
                self.height,
                expected_size,
                rgb_data.len()
            )));
        }

        // Store the RGB frame data directly
        self.frames.push(rgb_data.to_vec());

        Ok(())
    }

    /// Stop recording and return the GIF data
    #[wasm_bindgen]
    pub fn stop_recording(&mut self) -> Result<Vec<u8>, JsValue> {
        if !self.is_recording {
            return Err(JsValue::from_str("Not currently recording"));
        }

        if self.frames.is_empty() {
            return Err(JsValue::from_str("No frames captured"));
        }

        // Create the GIF from all collected frames
        self.buffer.clear();
        let mut encoder = Encoder::new(&mut self.buffer, self.width, self.height, &[])
            .map_err(|e| JsValue::from_str(&format!("Failed to create GIF encoder: {}", e)))?;

        encoder
            .set_repeat(Repeat::Infinite)
            .map_err(|e| JsValue::from_str(&format!("Failed to set repeat: {}", e)))?;

        // Convert frame delay from milliseconds to centiseconds
        let delay_centiseconds = (self.frame_delay_ms + 5) / 10; // Round up

        // Write all frames
        for frame_pixels in &self.frames {
            let mut frame = Frame::from_rgb(self.width, self.height, frame_pixels);
            frame.delay = delay_centiseconds;

            encoder
                .write_frame(&frame)
                .map_err(|e| JsValue::from_str(&format!("Failed to write frame: {}", e)))?;
        }

        // Finalize the encoder
        drop(encoder);

        self.is_recording = false;
        let gif_data = self.buffer.clone();

        log_with_level(
            Level::Info,
            format!(
                "Stopped GIF recording, generated {} bytes from {} frames",
                gif_data.len(),
                self.frames.len()
            ),
        );

        // Clear frames to free memory
        self.frames.clear();

        Ok(gif_data)
    }

    /// Check if currently recording
    #[wasm_bindgen]
    pub fn is_recording(&self) -> bool {
        self.is_recording
    }

    /// Get current frame delay in milliseconds
    #[wasm_bindgen]
    pub fn get_frame_delay(&self) -> u16 {
        self.frame_delay_ms
    }
}

/// Backward compatibility functions that maintain the original interface

/// Legacy tick function for backward compatibility
#[wasm_bindgen]
pub fn tick(current: &[u8]) -> Vec<u8> {
    log_with_level(Level::Info, "Using legacy tick function".to_string());

    // Assume default dimensions for legacy calls
    let width = DEFAULT_WIDTH;
    let height = DEFAULT_HEIGHT;

    if current.len() != width * height {
        console::error_1(&"Invalid grid size for legacy tick function".into());
        return current.to_vec();
    }

    // Create temporary engine and load data
    let mut engine = UltimateEngine::<4>::new(width, height);
    let mut grid = StandardGrid::new(width, height);

    for row in 0..height {
        for col in 0..width {
            let idx = row * width + col;
            grid.set_cell(row, col, current[idx] != 0);
        }
    }

    engine.set_grid(&grid);
    engine.step();

    // Extract result
    let mut result = vec![0u8; width * height];
    for row in 0..height {
        for col in 0..width {
            let idx = row * width + col;
            result[idx] = if engine.get_cell(row, col) { 1 } else { 0 };
        }
    }

    result
}

/// Legacy sample grid function
#[wasm_bindgen]
pub fn sample_grid() -> Vec<u8> {
    let mut grid = vec![0; DEFAULT_WIDTH * DEFAULT_HEIGHT];

    // Create a glider pattern at the same position as before
    let index = |row: usize, col: usize| row * DEFAULT_WIDTH + col;

    grid[index(1, 0)] = 1;
    grid[index(2, 1)] = 1;
    grid[index(0, 2)] = 1;
    grid[index(1, 2)] = 1;
    grid[index(2, 2)] = 1;

    log_with_level(
        Level::Info,
        "Returning legacy sample grid with glider pattern".to_string(),
    );
    grid
}

/// Legacy index function
#[wasm_bindgen]
pub fn index(row: usize, col: usize) -> usize {
    row * DEFAULT_WIDTH + col
}

/// Legacy count neighbors function
#[wasm_bindgen]
pub fn count_neighbors(grid: &[u8], row: usize, col: usize) -> u8 {
    let width = DEFAULT_WIDTH;
    let height = DEFAULT_HEIGHT;
    let mut count = 0;

    for dr in [-1, 0, 1].iter() {
        for dc in [-1, 0, 1].iter() {
            if *dr == 0 && *dc == 0 {
                continue;
            }
            let r = row as isize + dr;
            let c = col as isize + dc;
            if r >= 0 && r < height as isize && c >= 0 && c < width as isize {
                let idx = (r as usize) * width + (c as usize);
                count += grid[idx];
            }
        }
    }
    count
}

/// Text to ASCII art conversion with configurable buffer
#[wasm_bindgen]
pub fn text_to_grid_with_buffer(text: &str, buffer_size: usize) -> Result<JsValue, JsValue> {
    if text.is_empty() {
        return Err(JsValue::from_str("Text cannot be empty"));
    }

    if text.len() > 50 {
        return Err(JsValue::from_str("Text too long (max 50 characters)"));
    }

    // Generate ASCII art
    let ascii_art = text_to_pixel_art(text)
        .map_err(|e| JsValue::from_str(&format!("Text conversion failed: {}", e)))?;

    // Parse the ASCII art
    let lines: Vec<&str> = ascii_art.trim().lines().collect();
    if lines.is_empty() {
        return Err(JsValue::from_str("Generated ASCII art is empty"));
    }

    let content_width = lines.iter().map(|line| line.len()).max().unwrap_or(0);
    let content_height = lines.len();

    // Add buffer padding
    let total_width = content_width + 2 * buffer_size;
    let total_height = content_height + 2 * buffer_size;

    // Create padded grid
    let mut grid = vec![0u8; total_width * total_height];

    for (line_idx, line) in lines.iter().enumerate() {
        let target_row = line_idx + buffer_size;
        for (char_idx, ch) in line.chars().enumerate() {
            let target_col = char_idx + buffer_size;
            let grid_idx = target_row * total_width + target_col;
            if grid_idx < grid.len() {
                grid[grid_idx] = if ch == '1' { 1 } else { 0 };
            }
        }
    }

    // Create result object
    #[derive(Serialize)]
    struct GridResult {
        grid: Vec<u8>,
        width: usize,
        height: usize,
    }

    let result = GridResult {
        grid,
        width: total_width,
        height: total_height,
    };

    serde_wasm_bindgen::to_value(&result)
        .map_err(|e| JsValue::from_str(&format!("Serialization failed: {}", e)))
}

/// Parse text file content and return grid data
#[wasm_bindgen]
pub fn parse_text_file(content: &str) -> Result<JsValue, JsValue> {
    let lines: Vec<&str> = content
        .trim()
        .lines()
        .filter(|line| !line.trim().is_empty())
        .collect();

    if lines.is_empty() {
        return Err(JsValue::from_str("File is empty or contains no valid data"));
    }

    // Validate format - should only contain 0s, 1s, and whitespace
    for (line_num, line) in lines.iter().enumerate() {
        if !line
            .chars()
            .all(|c| c == '0' || c == '1' || c.is_whitespace())
        {
            return Err(JsValue::from_str(&format!(
                "Invalid character in line {}: expected only 0s and 1s",
                line_num + 1
            )));
        }
    }

    // Calculate dimensions
    let height = lines.len();
    let width = lines
        .iter()
        .map(|line| line.replace(' ', "").len())
        .max()
        .unwrap_or(0);

    if width == 0 {
        return Err(JsValue::from_str("No valid data found in file"));
    }

    // Parse grid data
    let mut grid = vec![0u8; width * height];
    for (row, line) in lines.iter().enumerate() {
        let clean_line = line.replace(' ', "");
        for (col, ch) in clean_line.chars().enumerate() {
            if col < width {
                let idx = row * width + col;
                grid[idx] = if ch == '1' { 1 } else { 0 };
            }
        }
    }

    // Create result object
    #[derive(Serialize)]
    struct FileResult {
        grid: Vec<u8>,
        width: usize,
        height: usize,
    }

    let result = FileResult {
        grid,
        width,
        height,
    };

    serde_wasm_bindgen::to_value(&result)
        .map_err(|e| JsValue::from_str(&format!("Serialization failed: {}", e)))
}

/// Create a new game instance with default dimensions
#[wasm_bindgen]
pub fn create_game() -> GameOfLifeWasm {
    GameOfLifeWasm::new(DEFAULT_WIDTH, DEFAULT_HEIGHT)
}

/// Create a new game instance with custom dimensions
#[wasm_bindgen]
pub fn create_game_with_size(width: usize, height: usize) -> GameOfLifeWasm {
    GameOfLifeWasm::new(width, height)
}

/// Utility function to validate grid dimensions
#[wasm_bindgen]
pub fn validate_dimensions(width: usize, height: usize) -> bool {
    width > 0 && height > 0 && width <= 1000 && height <= 1000
}

/// Get version information
#[wasm_bindgen]
pub fn get_version() -> String {
    "2.0.0-ultimate".to_string()
}

// Initialize panic hook for better error messages
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}
