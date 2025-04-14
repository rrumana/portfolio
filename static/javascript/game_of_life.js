// static/javascript/game_of_life.js

// Import the WASM module functions.
import init, { init_logging, tick, sample_grid } from "../wasm/wasm_game_of_life.js";

// Grab DOM elements.
const canvas = document.getElementById("lifeCanvas");
const ctx = canvas.getContext("2d");
const stepBtn = document.getElementById("stepBtn");
const backBtn = document.getElementById("backBtn"); // Not implemented in local simulation.
const resetBtn = document.getElementById("resetBtn");
const multiStepBtn = document.getElementById("multiStepBtn");
const speedRange = document.getElementById("speedRange");
const genInput = document.getElementById("genInput");
const delayDisplay = document.getElementById("delayDisplay");

const CELL_SIZE = 20;
const GRID_WIDTH = canvas.width / CELL_SIZE;
const GRID_HEIGHT = canvas.height / CELL_SIZE;

// Update the delay display whenever the slider value changes.
speedRange.addEventListener("input", () => {
  delayDisplay.textContent = "Frame Delay: " + speedRange.value + "ms";
});

// Local simulation state and history.
let localGrid = new Uint8Array(GRID_WIDTH * GRID_HEIGHT);
let gridHistory = [];

// Global flag for multi-step cancellation.
let multiStepActive = false;

// Helper function: delay for a given number of milliseconds.
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Draw the grid onto the canvas.
function drawGrid(grid) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#ccc"; // Ensure grid lines are visible.
  for (let row = 0; row < GRID_HEIGHT; row++) {
    for (let col = 0; col < GRID_WIDTH; col++) {
      const cell = grid[row * GRID_WIDTH + col];
      ctx.fillStyle = cell === 1 ? "#000" : "#fff";
      ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

// Initialize the simulation using WASM.
async function initializeSimulation() {
  try {
    await init();
    init_logging();
    console.log("WASM module loaded and logging initialized.");
    // Initialize local grid with a sample pattern (e.g. a glider).
    localGrid = sample_grid();
    gridHistory = []; // Clear any previous history.
    drawGrid(localGrid);
  } catch (error) {
    console.error("Error initializing WASM module:", error);
  }
}

// Advance the simulation one tick using WASM, saving the current state for history.
async function localStepForward() {
  try {
    // Save current state.
    gridHistory.push(localGrid.slice());
    localGrid = tick(localGrid);
    drawGrid(localGrid);
  } catch (error) {
    console.error("Error during local step forward:", error);
  }
}

// Step back by restoring the previous state from history.
async function localStepBack() {
  try {
    if (gridHistory.length > 0) {
      localGrid = gridHistory.pop();
      drawGrid(localGrid);
    } else {
      console.warn("No previous state to revert to.");
    }
  } catch (error) {
    console.error("Error during step back:", error);
  }
}

// Reset the simulation, and cancel any ongoing multi-step loop.
async function resetSimulation() {
  try {
    multiStepActive = false; // Cancel multi-step.
    localGrid = sample_grid();
    gridHistory = [];
    drawGrid(localGrid);
  } catch (error) {
    console.error("Error during simulation reset:", error);
  }
}

// Advance multiple steps with a delay between frames.
async function localMultiStep() {
  const generations = parseInt(genInput.value, 10);
  const delayMs = parseInt(speedRange.value, 10);
  multiStepActive = true;
  for (let i = 0; i < generations; i++) {
    if (!multiStepActive) {
      console.log("Multi-step cancelled");
      break;
    }
    await localStepForward();
    await delay(delayMs);
  }
  multiStepActive = false;
}

// Toggle cell state on canvas click.
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const col = Math.floor(x / CELL_SIZE);
  const row = Math.floor(y / CELL_SIZE);
  const idx = row * GRID_WIDTH + col;
  localGrid[idx] = localGrid[idx] === 0 ? 1 : 0;
  drawGrid(localGrid);
  console.log(`Toggled cell at row ${row}, col ${col}`);
});

// Attach event listeners to buttons.
stepBtn.addEventListener("click", localStepForward);
backBtn.addEventListener("click", localStepBack);
resetBtn.addEventListener("click", resetSimulation);
multiStepBtn.addEventListener("click", localMultiStep);

// Optional: Auto-simulation (if desired).
let autoInterval;
speedRange.addEventListener("change", () => {
  const speed = parseInt(speedRange.value, 10);
  clearInterval(autoInterval);
  // To enable auto-stepping, uncomment the line below:
  // autoInterval = setInterval(localStepForward, speed);
});

// Initialize simulation on page load.
export async function initGameOfLife() {
  await initializeSimulation();
}
