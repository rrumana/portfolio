let wasm;

let WASM_VECTOR_LEN = 0;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

export function init_logging() {
    wasm.init_logging();
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_3.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}
/**
 * Backward compatibility functions that maintain the original interface
 * Legacy tick function for backward compatibility
 * @param {Uint8Array} current
 * @returns {Uint8Array}
 */
export function tick(current) {
    const ptr0 = passArray8ToWasm0(current, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.tick(ptr0, len0);
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Legacy sample grid function
 * @returns {Uint8Array}
 */
export function sample_grid() {
    const ret = wasm.sample_grid();
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * Legacy index function
 * @param {number} row
 * @param {number} col
 * @returns {number}
 */
export function index(row, col) {
    const ret = wasm.index(row, col);
    return ret >>> 0;
}

/**
 * Legacy count neighbors function
 * @param {Uint8Array} grid
 * @param {number} row
 * @param {number} col
 * @returns {number}
 */
export function count_neighbors(grid, row, col) {
    const ptr0 = passArray8ToWasm0(grid, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.count_neighbors(ptr0, len0, row, col);
    return ret;
}

/**
 * Text to ASCII art conversion with configurable buffer
 * @param {string} text
 * @param {number} buffer_size
 * @returns {any}
 */
export function text_to_grid_with_buffer(text, buffer_size) {
    const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.text_to_grid_with_buffer(ptr0, len0, buffer_size);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Parse text file content and return grid data
 * @param {string} content
 * @returns {any}
 */
export function parse_text_file(content) {
    const ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.parse_text_file(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Create a new game instance with default dimensions
 * @returns {GameOfLifeWasm}
 */
export function create_game() {
    const ret = wasm.create_game();
    return GameOfLifeWasm.__wrap(ret);
}

/**
 * Create a new game instance with custom dimensions
 * @param {number} width
 * @param {number} height
 * @returns {GameOfLifeWasm}
 */
export function create_game_with_size(width, height) {
    const ret = wasm.create_game_with_size(width, height);
    return GameOfLifeWasm.__wrap(ret);
}

/**
 * Utility function to validate grid dimensions
 * @param {number} width
 * @param {number} height
 * @returns {boolean}
 */
export function validate_dimensions(width, height) {
    const ret = wasm.validate_dimensions(width, height);
    return ret !== 0;
}

/**
 * Get version information
 * @returns {string}
 */
export function get_version() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.get_version();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

export function main() {
    wasm.main();
}

const GameOfLifeWasmFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_gameoflifewasm_free(ptr >>> 0, 1));
/**
 * Game of Life WASM wrapper that maintains compatibility with existing interface
 */
export class GameOfLifeWasm {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(GameOfLifeWasm.prototype);
        obj.__wbg_ptr = ptr;
        GameOfLifeWasmFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GameOfLifeWasmFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_gameoflifewasm_free(ptr, 0);
    }
    /**
     * @param {number} width
     * @param {number} height
     */
    constructor(width, height) {
        const ret = wasm.gameoflifewasm_new(width, height);
        this.__wbg_ptr = ret >>> 0;
        GameOfLifeWasmFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Get the current grid state as a flat array
     * @returns {Uint8Array}
     */
    get_state() {
        const ret = wasm.gameoflifewasm_get_state(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Step the simulation forward one generation
     */
    step() {
        wasm.gameoflifewasm_step(this.__wbg_ptr);
    }
    /**
     * Set a cell at the given row and column
     * @param {number} row
     * @param {number} col
     * @param {boolean} alive
     */
    set_cell(row, col, alive) {
        wasm.gameoflifewasm_set_cell(this.__wbg_ptr, row, col, alive);
    }
    /**
     * Get a cell at the given row and column
     * @param {number} row
     * @param {number} col
     * @returns {boolean}
     */
    get_cell(row, col) {
        const ret = wasm.gameoflifewasm_get_cell(this.__wbg_ptr, row, col);
        return ret !== 0;
    }
    /**
     * Toggle a cell at the given row and column
     * @param {number} row
     * @param {number} col
     */
    toggle_cell(row, col) {
        wasm.gameoflifewasm_toggle_cell(this.__wbg_ptr, row, col);
    }
    /**
     * Clear the grid
     */
    clear() {
        wasm.gameoflifewasm_clear(this.__wbg_ptr);
    }
    /**
     * Resize the grid to new dimensions
     * @param {number} width
     * @param {number} height
     */
    resize(width, height) {
        wasm.gameoflifewasm_resize(this.__wbg_ptr, width, height);
    }
    /**
     * Load grid from a flat array
     * @param {Uint8Array} data
     * @param {number} width
     * @param {number} height
     */
    load_from_array(data, width, height) {
        const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.gameoflifewasm_load_from_array(this.__wbg_ptr, ptr0, len0, width, height);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Get grid dimensions
     * @returns {Array<any>}
     */
    get_dimensions() {
        const ret = wasm.gameoflifewasm_get_dimensions(this.__wbg_ptr);
        return ret;
    }
    /**
     * Count live cells
     * @returns {number}
     */
    count_live_cells() {
        const ret = wasm.gameoflifewasm_count_live_cells(this.__wbg_ptr);
        return ret >>> 0;
    }
}

const GifRecorderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_gifrecorder_free(ptr >>> 0, 1));
/**
 * GIF Recorder for capturing Game of Life animations
 */
export class GifRecorder {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GifRecorderFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_gifrecorder_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.gifrecorder_new();
        this.__wbg_ptr = ret >>> 0;
        GifRecorderFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Start recording with specified dimensions and frame delay
     * @param {number} width
     * @param {number} height
     * @param {number} frame_delay_ms
     */
    start_recording(width, height, frame_delay_ms) {
        const ret = wasm.gifrecorder_start_recording(this.__wbg_ptr, width, height, frame_delay_ms);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Add a frame to the GIF from RGB image data
     * @param {Uint8Array} rgb_data
     */
    capture_frame(rgb_data) {
        const ptr0 = passArray8ToWasm0(rgb_data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.gifrecorder_capture_frame(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Stop recording and return the GIF data
     * @returns {Uint8Array}
     */
    stop_recording() {
        const ret = wasm.gifrecorder_stop_recording(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Check if currently recording
     * @returns {boolean}
     */
    is_recording() {
        const ret = wasm.gifrecorder_is_recording(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Get current frame delay in milliseconds
     * @returns {number}
     */
    get_frame_delay() {
        const ret = wasm.gifrecorder_get_frame_delay(this.__wbg_ptr);
        return ret;
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_String_8f0eb39a4a4c2f66 = function(arg0, arg1) {
        const ret = String(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_debug_3cb59063b29f58c1 = function(arg0) {
        console.debug(arg0);
    };
    imports.wbg.__wbg_error_524f506f44df1645 = function(arg0) {
        console.error(arg0);
    };
    imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_info_3daf2e093e091b66 = function(arg0) {
        console.info(arg0);
    };
    imports.wbg.__wbg_log_c222819a41e063d3 = function(arg0) {
        console.log(arg0);
    };
    imports.wbg.__wbg_new_405e22f390576ce2 = function() {
        const ret = new Object();
        return ret;
    };
    imports.wbg.__wbg_new_78feb108b6472713 = function() {
        const ret = new Array();
        return ret;
    };
    imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
        const ret = new Error();
        return ret;
    };
    imports.wbg.__wbg_push_737cfc8c1432c2c6 = function(arg0, arg1) {
        const ret = arg0.push(arg1);
        return ret;
    };
    imports.wbg.__wbg_set_37837023f3d740e8 = function(arg0, arg1, arg2) {
        arg0[arg1 >>> 0] = arg2;
    };
    imports.wbg.__wbg_set_3f1d0b984ed272ed = function(arg0, arg1, arg2) {
        arg0[arg1] = arg2;
    };
    imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
        const ret = arg1.stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_warn_4ca3906c248c47c4 = function(arg0) {
        console.warn(arg0);
    };
    imports.wbg.__wbindgen_bigint_from_u64 = function(arg0) {
        const ret = BigInt.asUintN(64, arg0);
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_export_3;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
        ;
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('wasm_game_of_life_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
