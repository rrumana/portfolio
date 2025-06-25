// static/javascript/game_of_life.js

// Import the WASM module functions - now with enhanced UltimateEngine support
import init, { 
    init_logging, 
    tick, 
    sample_grid,
    GameOfLifeWasm,
    create_game,
    create_game_with_size,
    text_to_grid_with_buffer,
    parse_text_file,
    validate_dimensions,
    get_version
} from "../wasm/wasm_game_of_life.js";

// Grab DOM elements
const canvas = document.getElementById("lifeCanvas");
const ctx = canvas.getContext("2d");
const stepBtn = document.getElementById("stepBtn");
const backBtn = document.getElementById("backBtn");
const resetBtn = document.getElementById("resetBtn");
const multiStepBtn = document.getElementById("multiStepBtn");
const speedRange = document.getElementById("speedRange");
const genInput = document.getElementById("genInput");
const delayDisplay = document.getElementById("delayDisplay");

// New UI elements for enhanced features
let textInput, bufferSizeSlider, bufferDisplay, generateTextBtn;
let fileInput, fileUploadBtn, downloadBtn;

// Game state
let gameInstance = null;
let gridHistory = [];
let multiStepActive = false;

// Grid display settings
let CELL_SIZE = 20;
let GRID_WIDTH = 20;
let GRID_HEIGHT = 20;

// Update the delay display whenever the slider value changes
speedRange.addEventListener("input", () => {
    delayDisplay.textContent = "Frame Delay: " + speedRange.value + "ms";
});

// Helper function: delay for a given number of milliseconds
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize enhanced UI elements (using existing HTML elements)
function initializeEnhancedUI() {
    // Get references to existing HTML elements
    textInput = document.getElementById("textInput");
    bufferSizeSlider = document.getElementById("bufferSizeSlider");
    bufferDisplay = document.getElementById("bufferDisplay");
    generateTextBtn = document.getElementById("generateTextBtn");
    fileInput = document.getElementById("fileInput");
    fileUploadBtn = document.getElementById("fileUploadBtn");
    downloadBtn = document.getElementById("downloadBtn");

    // Add event listeners
    setupEnhancedEventListeners();
}

// Setup event listeners for new features
function setupEnhancedEventListeners() {
    // Buffer size slider (display actual value, subtract 1 when passing to Rust)
    bufferSizeSlider.addEventListener("input", () => {
        bufferDisplay.textContent = bufferSizeSlider.value;
    });

    // Generate from text
    generateTextBtn.addEventListener("click", generateFromText);

    // File upload
    fileUploadBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", handleFileSelect);

    // Drag and drop (only if element exists)
    const dragDropArea = document.getElementById("dragDropArea");
    if (dragDropArea) {
        dragDropArea.addEventListener("dragover", handleDragOver);
        dragDropArea.addEventListener("drop", handleFileDrop);
    }

    // Download
    downloadBtn.addEventListener("click", downloadCurrentState);

    // Canvas mouse events for cell toggling
    canvas.addEventListener("mousedown", handleMouseDown);
}

// Generate ASCII art from text input
async function generateFromText() {
    const text = textInput.value.trim();
    const bufferSize = parseInt(bufferSizeSlider.value) - 1; // Subtract 1 since Rust adds extra buffer

    if (!text) {
        showError("Please enter some text");
        return;
    }

    try {
        const result = text_to_grid_with_buffer(text, bufferSize);
        await loadGridFromData(result.grid, result.width, result.height);
        showSuccess(`Generated ${result.width}x${result.height} grid from "${text}"`);
    } catch (error) {
        showError(`Text generation failed: ${error}`);
    }
}

// Handle file selection
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        await processFile(file);
    }
}

// Handle drag and drop
function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
}

async function handleFileDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        await processFile(files[0]);
    }
}

// Process uploaded file
async function processFile(file) {
    if (!file.name.endsWith('.txt')) {
        showError("Please select a .txt file");
        return;
    }

    try {
        const content = await file.text();
        const result = parse_text_file(content);
        await loadGridFromData(result.grid, result.width, result.height);
        showSuccess(`Loaded ${result.width}x${result.height} grid from ${file.name}`);
        document.getElementById("fileName").textContent = file.name;
    } catch (error) {
        showError(`File loading failed: ${error}`);
    }
}

// Load grid from data array
async function loadGridFromData(gridData, width, height) {
    if (!validate_dimensions(width, height)) {
        throw new Error(`Invalid dimensions: ${width}x${height}`);
    }

    // Create new game instance with new dimensions
    gameInstance = create_game_with_size(width, height);
    await gameInstance.load_from_array(gridData, width, height);

    // Update grid dimensions
    GRID_WIDTH = width;
    GRID_HEIGHT = height;

    // Resize canvas and reset view
    resizeCanvas();
    
    // Clear history
    gridHistory = [];
    
    // Redraw
    drawGrid();
    updateInfo();
}

// Resize canvas based on grid dimensions
function resizeCanvas() {
    const maxCanvasSize = 600;
    const minCellSize = 2;
    const maxCellSize = 30;

    let cellSize = Math.min(
        Math.floor(maxCanvasSize / GRID_WIDTH),
        Math.floor(maxCanvasSize / GRID_HEIGHT),
        maxCellSize
    );
    cellSize = Math.max(cellSize, minCellSize);

    CELL_SIZE = cellSize;
    canvas.width = GRID_WIDTH * CELL_SIZE;
    canvas.height = GRID_HEIGHT * CELL_SIZE;
}

// Draw the grid onto the canvas
function drawGrid() {
    if (!gameInstance) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get current state
    const state = gameInstance.get_state();
    
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;

    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            const cell = state[row * GRID_WIDTH + col];
            const x = col * CELL_SIZE;
            const y = row * CELL_SIZE;
            
            ctx.fillStyle = cell === 1 ? "#000" : "#fff";
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        }
    }
}

// Update info displays
function updateInfo() {
    if (!gameInstance) return;

    // Grid info displays are optional since they were removed from UI
    const liveCells = gameInstance.count_live_cells();
    
    // Only update if elements exist (for backward compatibility)
    const gridSizeDisplay = document.getElementById("gridSizeDisplay");
    const liveCellsDisplay = document.getElementById("liveCellsDisplay");
    
    if (gridSizeDisplay) {
        gridSizeDisplay.textContent = `Grid: ${GRID_WIDTH}x${GRID_HEIGHT}`;
    }
    if (liveCellsDisplay) {
        liveCellsDisplay.textContent = `Live cells: ${liveCells}`;
    }
}

// Mouse handling for cell toggling

function handleMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Account for CSS scaling - convert from visual coordinates to canvas coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = mouseX * scaleX;
    const canvasY = mouseY * scaleY;
    
    toggleCellAtPosition(canvasX, canvasY);
}


// Toggle cell at mouse position
function toggleCellAtPosition(x, y) {
    if (!gameInstance) return;

    // Simple direct coordinate mapping
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    
    console.log(`Click at (${x}, ${y}) -> Grid (${row}, ${col}) | CELL_SIZE: ${CELL_SIZE} | Grid: ${GRID_WIDTH}x${GRID_HEIGHT}`);
    
    if (row >= 0 && row < GRID_HEIGHT && col >= 0 && col < GRID_WIDTH) {
        gameInstance.toggle_cell(row, col);
        drawGrid();
        updateInfo();
        console.log(`Toggled cell (${row}, ${col})`);
    } else {
        console.log(`Click outside bounds: (${row}, ${col})`);
    }
}

// Download current state as text file
function downloadCurrentState() {
    if (!gameInstance) return;

    const state = gameInstance.get_state();
    let content = "";
    
    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            const idx = row * GRID_WIDTH + col;
            content += state[idx];
        }
        content += "\n";
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `game_of_life_${GRID_WIDTH}x${GRID_HEIGHT}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Show success message
function showSuccess(message) {
    console.log("SUCCESS:", message);
    // Could add a toast notification here
}

// Show error message
function showError(message) {
    console.error("ERROR:", message);
    alert(message); // Simple error display for now
}

// Initialize the simulation using WASM with enhanced features
async function initializeSimulation() {
    try {
        await init();
        init_logging();
        console.log("WASM module loaded and logging initialized.");
        
        // Display version info
        // Version display removed - no longer needed
        
        // Initialize enhanced UI
        initializeEnhancedUI();
        
        // Initialize with default game size
        GRID_WIDTH = 20;
        GRID_HEIGHT = 20;
        gameInstance = create_game_with_size(GRID_WIDTH, GRID_HEIGHT);
        
        // Load sample pattern
        const sampleData = sample_grid();
        await gameInstance.load_from_array(sampleData, GRID_WIDTH, GRID_HEIGHT);
        
        // Resize canvas to match grid dimensions
        resizeCanvas();
        
        gridHistory = [];
        drawGrid();
        updateInfo();
        
        console.log("Enhanced Game of Life initialized with UltimateEngine");
    } catch (error) {
        console.error("Error initializing WASM module:", error);
        showError("Failed to initialize Game of Life engine");
    }
}

// Advance the simulation one tick using enhanced engine
async function localStepForward() {
    if (!gameInstance) return;
    
    try {
        // Save current state for history
        const currentState = gameInstance.get_state();
        gridHistory.push(Array.from(currentState));
        
        // Step forward
        gameInstance.step();
        drawGrid();
        updateInfo();
    } catch (error) {
        console.error("Error during local step forward:", error);
    }
}

// Step back by restoring the previous state from history
async function localStepBack() {
    if (!gameInstance) return;
    
    try {
        if (gridHistory.length > 0) {
            const previousState = gridHistory.pop();
            await gameInstance.load_from_array(previousState, GRID_WIDTH, GRID_HEIGHT);
            drawGrid();
            updateInfo();
        } else {
            console.warn("No previous state to revert to.");
        }
    } catch (error) {
        console.error("Error during step back:", error);
    }
}

// Reset the simulation
async function resetSimulation() {
    if (!gameInstance) return;
    
    try {
        multiStepActive = false;
        
        // Reset grid dimensions to default first
        GRID_WIDTH = 20;
        GRID_HEIGHT = 20;
        
        // Create new game instance with correct dimensions
        gameInstance = create_game_with_size(GRID_WIDTH, GRID_HEIGHT);
        
        // Load sample pattern
        const sampleData = sample_grid();
        await gameInstance.load_from_array(sampleData, GRID_WIDTH, GRID_HEIGHT);
        
        resizeCanvas();
        
        gridHistory = [];
        drawGrid();
        updateInfo();
    } catch (error) {
        console.error("Error during simulation reset:", error);
    }
}

// Advance multiple steps with a delay between frames
async function localMultiStep() {
    if (!gameInstance) return;
    
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

// Legacy canvas click handler removed - using mousedown handler instead

// Attach event listeners to buttons
stepBtn.addEventListener("click", localStepForward);
backBtn.addEventListener("click", localStepBack);
resetBtn.addEventListener("click", resetSimulation);
multiStepBtn.addEventListener("click", localMultiStep);

// Optional: Auto-simulation (if desired)
let autoInterval;
speedRange.addEventListener("change", () => {
    const speed = parseInt(speedRange.value, 10);
    clearInterval(autoInterval);
    // To enable auto-stepping, uncomment the line below:
    // autoInterval = setInterval(localStepForward, speed);
});

// Toggle function for collapsible proof sections
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const content = section.querySelector('.section-content');
    const indicator = section.querySelector('.collapse-indicator');
    
    if (!content || !indicator) return;
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        indicator.textContent = '▼';
    } else {
        content.style.display = 'none';
        indicator.textContent = '▶';
    }
}

// Toggle function for the main proof section
function toggleProof() {
    const proofContent = document.getElementById('proof-content');
    const indicator = document.getElementById('proof-indicator');
    
    if (!proofContent || !indicator) return;
    
    if (proofContent.style.display === 'none') {
        proofContent.style.display = 'block';
        indicator.textContent = '▲';
    } else {
        proofContent.style.display = 'none';
        indicator.textContent = '▼';
    }
}

// Toggle function for the optimizations section
function toggleOptimizations() {
    const optimizationsContent = document.getElementById('optimizations-content');
    const indicator = document.getElementById('optimizations-indicator');
    
    if (!optimizationsContent || !indicator) return;
    
    if (optimizationsContent.style.display === 'none') {
        optimizationsContent.style.display = 'block';
        indicator.textContent = '▲';
    } else {
        optimizationsContent.style.display = 'none';
        indicator.textContent = '▼';
    }
}

// Toggle function for the implementation section
function toggleImplementation() {
    const implementationContent = document.getElementById('implementation-content');
    const indicator = document.getElementById('implementation-indicator');
    
    if (!implementationContent || !indicator) return;
    
    if (implementationContent.style.display === 'none') {
        implementationContent.style.display = 'block';
        indicator.textContent = '▲';
    } else {
        implementationContent.style.display = 'none';
        indicator.textContent = '▼';
    }
}

// Toggle function for the chaos section
function toggleChaos() {
    const chaosContent = document.getElementById('chaos-content');
    const indicator = document.getElementById('chaos-indicator');
    
    if (!chaosContent || !indicator) return;
    
    if (chaosContent.style.display === 'none') {
        chaosContent.style.display = 'block';
        indicator.textContent = '▲';
    } else {
        chaosContent.style.display = 'none';
        indicator.textContent = '▼';
    }
}

// Toggle function for the crates section
function toggleCrates() {
    const cratesContent = document.getElementById('crates-content');
    const indicator = document.getElementById('crates-indicator');
    
    if (!cratesContent || !indicator) return;
    
    if (cratesContent.style.display === 'none') {
        cratesContent.style.display = 'block';
        indicator.textContent = '▲';
    } else {
        cratesContent.style.display = 'none';
        indicator.textContent = '▼';
    }
}

// Toggle function for the results and analysis section
function toggleResultsAnalysis() {
    const resultsAnalysisContent = document.getElementById('results-analysis-content');
    const indicator = document.getElementById('results-analysis-indicator');
    
    if (!resultsAnalysisContent || !indicator) return;
    
    if (resultsAnalysisContent.style.display === 'none') {
        resultsAnalysisContent.style.display = 'block';
        indicator.textContent = '▲';
    } else {
        resultsAnalysisContent.style.display = 'none';
        indicator.textContent = '▼';
    }
}

// Make functions globally available
window.toggleSection = toggleSection;
window.toggleProof = toggleProof;
window.toggleOptimizations = toggleOptimizations;
window.toggleImplementation = toggleImplementation;
window.toggleChaos = toggleChaos;
window.toggleCrates = toggleCrates;
window.toggleResultsAnalysis = toggleResultsAnalysis;

// Initialize simulation on page load
export async function initGameOfLife() {
    await initializeSimulation();
}
