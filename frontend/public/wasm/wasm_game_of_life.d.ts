/* tslint:disable */
/* eslint-disable */
export function init_logging(): void;
/**
 * Backward compatibility functions that maintain the original interface
 * Legacy tick function for backward compatibility
 */
export function tick(current: Uint8Array): Uint8Array;
/**
 * Legacy sample grid function
 */
export function sample_grid(): Uint8Array;
/**
 * Legacy index function
 */
export function index(row: number, col: number): number;
/**
 * Legacy count neighbors function
 */
export function count_neighbors(grid: Uint8Array, row: number, col: number): number;
/**
 * Text to ASCII art conversion with configurable buffer
 */
export function text_to_grid_with_buffer(text: string, buffer_size: number): any;
/**
 * Parse text file content and return grid data
 */
export function parse_text_file(content: string): any;
/**
 * Create a new game instance with default dimensions
 */
export function create_game(): GameOfLifeWasm;
/**
 * Create a new game instance with custom dimensions
 */
export function create_game_with_size(width: number, height: number): GameOfLifeWasm;
/**
 * Utility function to validate grid dimensions
 */
export function validate_dimensions(width: number, height: number): boolean;
/**
 * Get version information
 */
export function get_version(): string;
export function main(): void;
/**
 * Game of Life WASM wrapper that maintains compatibility with existing interface
 */
export class GameOfLifeWasm {
  free(): void;
  constructor(width: number, height: number);
  /**
   * Get the current grid state as a flat array
   */
  get_state(): Uint8Array;
  /**
   * Step the simulation forward one generation
   */
  step(): void;
  /**
   * Set a cell at the given row and column
   */
  set_cell(row: number, col: number, alive: boolean): void;
  /**
   * Get a cell at the given row and column
   */
  get_cell(row: number, col: number): boolean;
  /**
   * Toggle a cell at the given row and column
   */
  toggle_cell(row: number, col: number): void;
  /**
   * Clear the grid
   */
  clear(): void;
  /**
   * Resize the grid to new dimensions
   */
  resize(width: number, height: number): void;
  /**
   * Load grid from a flat array
   */
  load_from_array(data: Uint8Array, width: number, height: number): void;
  /**
   * Get grid dimensions
   */
  get_dimensions(): Array<any>;
  /**
   * Count live cells
   */
  count_live_cells(): number;
}
/**
 * GIF Recorder for capturing Game of Life animations
 */
export class GifRecorder {
  free(): void;
  constructor();
  /**
   * Start recording with specified dimensions and frame delay
   */
  start_recording(width: number, height: number, frame_delay_ms: number): void;
  /**
   * Add a frame to the GIF from the current game state
   */
  capture_frame(game_state: Uint8Array): void;
  /**
   * Stop recording and return the GIF data
   */
  stop_recording(): Uint8Array;
  /**
   * Check if currently recording
   */
  is_recording(): boolean;
  /**
   * Get current frame delay in milliseconds
   */
  get_frame_delay(): number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly init_logging: () => void;
  readonly __wbg_gameoflifewasm_free: (a: number, b: number) => void;
  readonly gameoflifewasm_new: (a: number, b: number) => number;
  readonly gameoflifewasm_get_state: (a: number) => [number, number];
  readonly gameoflifewasm_step: (a: number) => void;
  readonly gameoflifewasm_set_cell: (a: number, b: number, c: number, d: number) => void;
  readonly gameoflifewasm_get_cell: (a: number, b: number, c: number) => number;
  readonly gameoflifewasm_toggle_cell: (a: number, b: number, c: number) => void;
  readonly gameoflifewasm_clear: (a: number) => void;
  readonly gameoflifewasm_resize: (a: number, b: number, c: number) => void;
  readonly gameoflifewasm_load_from_array: (a: number, b: number, c: number, d: number, e: number) => [number, number];
  readonly gameoflifewasm_get_dimensions: (a: number) => any;
  readonly gameoflifewasm_count_live_cells: (a: number) => number;
  readonly __wbg_gifrecorder_free: (a: number, b: number) => void;
  readonly gifrecorder_new: () => number;
  readonly gifrecorder_start_recording: (a: number, b: number, c: number, d: number) => [number, number];
  readonly gifrecorder_capture_frame: (a: number, b: number, c: number) => [number, number];
  readonly gifrecorder_stop_recording: (a: number) => [number, number, number, number];
  readonly gifrecorder_is_recording: (a: number) => number;
  readonly gifrecorder_get_frame_delay: (a: number) => number;
  readonly tick: (a: number, b: number) => [number, number];
  readonly sample_grid: () => [number, number];
  readonly index: (a: number, b: number) => number;
  readonly count_neighbors: (a: number, b: number, c: number, d: number) => number;
  readonly text_to_grid_with_buffer: (a: number, b: number, c: number) => [number, number, number];
  readonly parse_text_file: (a: number, b: number) => [number, number, number];
  readonly create_game: () => number;
  readonly create_game_with_size: (a: number, b: number) => number;
  readonly validate_dimensions: (a: number, b: number) => number;
  readonly get_version: () => [number, number];
  readonly main: () => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_3: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
