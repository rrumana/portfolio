// static/javascript/game_of_life.js

const LOG_ENDPOINT = "/api/logs";
const CLIENT_COOKIE = "portfolio_client_id";
const ONE_YEAR_SECONDS = 31_536_000;
const isDev =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

let cachedClientId = null;
let remoteLoggingFailed = false;
let globalHandlersInstalled = false;

function getCookie(name) {
    return document.cookie
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`))
        ?.split("=")[1] ?? null;
}

function setCookie(name, value, maxAgeSeconds) {
    document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function ensureClientId() {
    if (cachedClientId) return cachedClientId;
    const fromCookie = getCookie(CLIENT_COOKIE);
    if (fromCookie) {
        cachedClientId = fromCookie;
        return cachedClientId;
    }
    const generated =
        (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
        `${Date.now()}`;
    cachedClientId = generated;
    setCookie(CLIENT_COOKIE, generated, ONE_YEAR_SECONDS);
    return cachedClientId;
}

async function sendLog(level, message, ctx = {}) {
    if (remoteLoggingFailed) return;

    const clientId = ensureClientId();
    const payload = {
        level,
        message,
        component: ctx.component,
        page: ctx.page || (typeof window !== "undefined" ? window.location.pathname : undefined),
        request_id: ctx.requestId,
        client_id: clientId,
        context: ctx.context,
    };

    if (isDev) {
        const fn =
            level === "error" ? console.error : level === "warn" ? console.warn : console.log;
        fn("[frontend]", level.toUpperCase(), message, ctx);
    }

    const body = JSON.stringify(payload);
    try {
        if (navigator.sendBeacon && level !== "debug") {
            const ok = navigator.sendBeacon(LOG_ENDPOINT, new Blob([body], { type: "application/json" }));
            if (ok) return;
        }
        await fetch(LOG_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            keepalive: true,
        });
    } catch (err) {
        remoteLoggingFailed = true;
        if (isDev) {
            console.warn("Remote logging disabled after failure:", err);
        }
    }
}

function logInfo(message, ctx = {}) {
    return sendLog("info", message, ctx);
}

function logWarn(message, ctx = {}) {
    return sendLog("warn", message, ctx);
}

function logError(message, ctx = {}) {
    return sendLog("error", message, ctx);
}

function logDebug(message, ctx = {}) {
    return sendLog("debug", message, ctx);
}

function installGlobalErrorHandlers(component = "frontend") {
    if (globalHandlersInstalled) return;
    globalHandlersInstalled = true;

    window.addEventListener("error", (event) => {
        logError("Unhandled error", {
            component,
            context: {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            },
        });
    });

    window.addEventListener("unhandledrejection", (event) => {
        logError("Unhandled rejection", {
            component,
            context: {
                reason: String(event.reason),
            },
        });
    });
}

function makeWasmLogSink(component = "wasm") {
    return (level, message) => {
        const normalized = level && level.toLowerCase();
        if (normalized === "warn" || normalized === "warning") {
            return logWarn(message, { component });
        }
        if (normalized === "error") {
            return logError(message, { component });
        }
        if (normalized === "debug") {
            return logDebug(message, { component });
        }
        return logInfo(message, { component });
    };
}

// WASM bindings (populated dynamically to keep dev-server happy when assets live in /public)
let wasmInit;
let init_logging;
let tick;
let sample_grid;
let GameOfLifeWasm;
let GifRecorder;
let create_game;
let create_game_with_size;
let text_to_grid_with_buffer;
let parse_text_file;
let validate_dimensions;
let get_version;
let set_log_hook;

async function loadWasmModule() {
    if (wasmInit) {
        return;
    }
    const wasmModuleUrl = new URL('/wasm/wasm_game_of_life.js', window.location.origin).href;
    const mod = await import(/* @vite-ignore */ wasmModuleUrl);
    wasmInit = mod.default;
    init_logging = mod.init_logging;
    tick = mod.tick;
    sample_grid = mod.sample_grid;
    GameOfLifeWasm = mod.GameOfLifeWasm;
    GifRecorder = mod.GifRecorder;
    create_game = mod.create_game;
    create_game_with_size = mod.create_game_with_size;
    text_to_grid_with_buffer = mod.text_to_grid_with_buffer;
    parse_text_file = mod.parse_text_file;
    validate_dimensions = mod.validate_dimensions;
    get_version = mod.get_version;
    set_log_hook = mod.set_log_hook;
    await wasmInit();
}

// Grab DOM elements
const canvas = document.getElementById("lifeCanvas");
const ctx = canvas.getContext("2d");
const stepBtn = document.getElementById("stepBtn");
const backBtn = document.getElementById("backBtn");
const resetBtn = document.getElementById("resetBtn");
const multiStepBtn = document.getElementById("multiStepBtn");
const recordBtn = document.getElementById("recordBtn");
const speedRange = document.getElementById("speedRange");
const genInput = document.getElementById("genInput");
const delayDisplay = document.getElementById("delayDisplay");

installGlobalErrorHandlers("game-of-life");

// New UI elements for enhanced features
let textInput, bufferSizeSlider, bufferDisplay, generateTextBtn;
let fileInput, fileUploadBtn, downloadBtn;

// Game state
let gameInstance = null;
let gridHistory = [];
let multiStepActive = false;

// GIF recording state
let gifRecorder = null;
let isRecording = false;

// Grid display settings
let CELL_SIZE = 20;
let GRID_WIDTH = 20;
let GRID_HEIGHT = 20;

// Update the delay display whenever the slider value changes
speedRange.addEventListener("input", () => {
    delayDisplay.textContent = "Frame Delay: " + speedRange.value + "ms";
});

// Add window resize listener for responsive canvas
let resizeTimeout;
window.addEventListener("resize", () => {
    // Debounce resize events to avoid excessive calls
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (gameInstance) {
            resizeCanvas();
            drawGrid();
        }
    }, 250);
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
        showSuccess(`Generated ${result.width}x${result.height} grid from "${text}"`, {
            width: result.width,
            height: result.height,
            bufferSize,
        });
    } catch (error) {
        showError("Text generation failed", { error: String(error), bufferSize });
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
        showError("Please select a .txt file", { fileName: file.name });
        return;
    }

    try {
        const content = await file.text();
        const result = parse_text_file(content);
        await loadGridFromData(result.grid, result.width, result.height);
        showSuccess(`Loaded ${result.width}x${result.height} grid from ${file.name}`, {
            width: result.width,
            height: result.height,
            fileName: file.name,
        });
        document.getElementById("fileName").textContent = file.name;
    } catch (error) {
        showError("File loading failed", { error: String(error), fileName: file.name });
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

// Resize canvas based on grid dimensions and container size
function resizeCanvas() {
    // Get the container element to determine available space
    const container = canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    
    // Calculate available space, accounting for padding and margins
    const availableWidth = Math.min(containerRect.width * 0.9, window.innerWidth * 0.9);
    const availableHeight = Math.min(window.innerHeight * 0.6, availableWidth); // Keep reasonable aspect ratio
    
    // Set responsive max canvas size based on screen size
    let maxCanvasSize;
    if (window.innerWidth <= 600) { // Mobile
        maxCanvasSize = Math.min(availableWidth, 350);
    } else if (window.innerWidth <= 900) { // Tablet
        maxCanvasSize = Math.min(availableWidth, 500);
    } else { // Desktop
        maxCanvasSize = Math.min(availableWidth, 600);
    }
    
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
    
    // Ensure canvas doesn't exceed container bounds
    const finalWidth = Math.min(canvas.width, maxCanvasSize);
    const finalHeight = Math.min(canvas.height, maxCanvasSize);
    
    if (canvas.width !== finalWidth || canvas.height !== finalHeight) {
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        // Recalculate cell size if canvas was constrained
        CELL_SIZE = Math.min(
            Math.floor(finalWidth / GRID_WIDTH),
            Math.floor(finalHeight / GRID_HEIGHT)
        );
    }
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
    
    logDebug("Canvas click", {
        component: "game-of-life",
        context: {
            x,
            y,
            row,
            col,
            cellSize: CELL_SIZE,
            grid: `${GRID_WIDTH}x${GRID_HEIGHT}`,
        },
    });
    
    if (row >= 0 && row < GRID_HEIGHT && col >= 0 && col < GRID_WIDTH) {
        gameInstance.toggle_cell(row, col);
        drawGrid();
        updateInfo();
        logInfo("Toggled cell", {
            component: "game-of-life",
            context: { row, col },
        });
    } else {
        logWarn("Canvas click outside bounds", {
            component: "game-of-life",
            context: { row, col },
        });
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
    logInfo("Downloaded current pattern", {
        component: "game-of-life",
        context: { width: GRID_WIDTH, height: GRID_HEIGHT },
    });
}

// GIF Recording Functions
async function toggleRecording() {
    if (!gameInstance) {
        showError("No game instance available");
        return;
    }

    if (!isRecording) {
        await startRecording();
    } else {
        await stopRecording();
    }
}

async function startRecording() {
    try {
        // Create new GIF recorder
        gifRecorder = new GifRecorder();
        
        // Get current frame delay from the speed slider
        const frameDelay = parseInt(speedRange.value, 10);
        
        // Start recording with canvas dimensions and frame delay
        await gifRecorder.start_recording(canvas.width, canvas.height, frameDelay);
        
        // Capture the initial frame from canvas
        await captureCanvasFrame();
        
        isRecording = true;
        recordBtn.textContent = "Stop Recording";
        recordBtn.style.backgroundColor = "#dc3545"; // Red color
        
        showSuccess("Started GIF recording", {
            frameDelayMs: frameDelay,
            width: canvas.width,
            height: canvas.height,
        });
    } catch (error) {
        showError("Failed to start recording", { error: String(error) });
        isRecording = false;
        recordBtn.textContent = "Record GIF";
        recordBtn.style.backgroundColor = "";
    }
}
// Capture current canvas frame for GIF recording
async function captureCanvasFrame() {
    if (!gifRecorder || !isRecording) return;
    
    try {
        // Get image data from canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Convert RGBA to RGB (GIF doesn't support alpha)
        const rgbData = new Uint8Array(canvas.width * canvas.height * 3);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const rgbIndex = (i / 4) * 3;
            rgbData[rgbIndex] = imageData.data[i];     // R
            rgbData[rgbIndex + 1] = imageData.data[i + 1]; // G
            rgbData[rgbIndex + 2] = imageData.data[i + 2]; // B
            // Skip alpha channel (imageData.data[i + 3])
        }
        
        // Send RGB data to WASM recorder
        await gifRecorder.capture_frame(rgbData);
    } catch (error) {
        logError("Failed to capture canvas frame", {
            component: "game-of-life",
            context: { error: String(error) },
        });
    }
}


async function stopRecording() {
    if (!gifRecorder || !isRecording) {
        showError("No active recording to stop");
        return;
    }

    try {
        // Stop recording and get GIF data
        const gifData = await gifRecorder.stop_recording();
        
        // Create blob and download
        const blob = new Blob([gifData], { type: "image/gif" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `game_of_life_${GRID_WIDTH}x${GRID_HEIGHT}_${Date.now()}.gif`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Reset recording state
        isRecording = false;
        gifRecorder = null;
        recordBtn.textContent = "Record GIF";
        recordBtn.style.backgroundColor = "";
        
        showSuccess("GIF saved", {
            sizeKb: Number((gifData.length / 1024).toFixed(1)),
            width: GRID_WIDTH,
            height: GRID_HEIGHT,
        });
    } catch (error) {
        showError("Failed to stop recording", { error: String(error) });
        isRecording = false;
        gifRecorder = null;
        recordBtn.textContent = "Record GIF";
        recordBtn.style.backgroundColor = "";
    }
}

// Show success message and emit to backend logs
function showSuccess(message, context = {}) {
    logInfo(message, { component: "game-of-life", context });
}

// Show error message and emit to backend logs
function showError(message, context = {}) {
    logError(message, { component: "game-of-life", context });
    alert(message); // Simple error display for now
}

// Initialize the simulation using WASM with enhanced features
async function initializeSimulation() {
    try {
        await loadWasmModule();
        init_logging();
        if (set_log_hook) {
            try {
                set_log_hook(makeWasmLogSink("wasm-engine"));
            } catch (hookError) {
                logWarn("Failed to attach WASM log hook", {
                    component: "game-of-life",
                    context: { error: String(hookError) },
                });
            }
        }
        logInfo("WASM module loaded and logging initialized", {
            component: "game-of-life",
        });
        
        initializeEnhancedUI();

        // Initialize with text-to-pattern sample: "Hello World" with buffer size 2
        GRID_WIDTH = 20;
        GRID_HEIGHT = 20;
        const initial = text_to_grid_with_buffer("Hello World", 1);
        GRID_WIDTH = initial.width;
        GRID_HEIGHT = initial.height;
        gameInstance = create_game_with_size(GRID_WIDTH, GRID_HEIGHT);
        await gameInstance.load_from_array(initial.grid, GRID_WIDTH, GRID_HEIGHT);

        resizeCanvas();
        gridHistory = [];
        drawGrid();
        updateInfo();

        logInfo("Game initialized with Hello World pattern", {
            component: "game-of-life",
            context: { width: GRID_WIDTH, height: GRID_HEIGHT },
        });
    } catch (error) {
        showError("Failed to initialize Game of Life engine", {
            error: String(error),
        });
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
        
        // Capture frame if recording (after drawing)
        if (isRecording && gifRecorder) {
            await captureCanvasFrame();
        }
        updateInfo();
    } catch (error) {
        logError("Error during local step forward", {
            component: "game-of-life",
            context: { error: String(error) },
        });
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
            logWarn("No previous state to revert to", { component: "game-of-life" });
        }
    } catch (error) {
        logError("Error during step back", {
            component: "game-of-life",
            context: { error: String(error) },
        });
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
        logInfo("Simulation reset", { component: "game-of-life" });
    } catch (error) {
        logError("Error during simulation reset", {
            component: "game-of-life",
            context: { error: String(error) },
        });
    }
}

// Advance multiple steps with a delay between frames
async function localMultiStep() {
    if (!gameInstance) return;
    
    const generations = parseInt(genInput.value, 10);
    const delayMs = parseInt(speedRange.value, 10);
    multiStepActive = true;
    let cancelled = false;

    logInfo("Multi-step started", {
        component: "game-of-life",
        context: { generations, delayMs },
    });
    
    for (let i = 0; i < generations; i++) {
        if (!multiStepActive) {
            logInfo("Multi-step cancelled", {
                component: "game-of-life",
                context: { completed: i, requested: generations },
            });
            cancelled = true;
            break;
        }
        await localStepForward();
        await delay(delayMs);
    }
    multiStepActive = false;
    if (!cancelled) {
        logInfo("Multi-step completed", {
            component: "game-of-life",
            context: { generations, delayMs },
        });
    }
}

// Legacy canvas click handler removed - using mousedown handler instead

// Attach event listeners to buttons
stepBtn.addEventListener("click", localStepForward);
backBtn.addEventListener("click", localStepBack);
resetBtn.addEventListener("click", resetSimulation);
multiStepBtn.addEventListener("click", localMultiStep);
recordBtn.addEventListener("click", toggleRecording);

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
