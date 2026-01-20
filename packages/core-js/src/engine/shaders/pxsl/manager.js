/**
 * ═══════════════════════════════════════════════════════════════════════════
 *                    PXSL Shader Manager
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright (c) 2020-2025 Kyle Derby MacInnis
 *
 * Unified shader management system that supports:
 *   - PXSL (.pxsl) - PixoSpritz Shader Language
 *   - GLSL (.glsl, .vert, .frag) - Standard WebGL shaders
 *
 * Features:
 *   - Automatic format detection
 *   - Shader caching
 *   - Hot-reload support
 *   - Error handling with helpful messages
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { PXSLTranspiler } from './transpiler.js';

/**
 * Shader cache entry
 * @typedef {Object} CachedShader
 * @property {string} name - Shader name
 * @property {string} vs - Vertex shader source
 * @property {string} fs - Fragment shader source
 * @property {WebGLProgram} [program] - Compiled program (if compiled)
 * @property {number} timestamp - Cache timestamp
 */

/**
 * Shader Manager - Handles loading, caching, and compiling shaders
 */
export class ShaderManager {
  /**
   * @param {WebGL2RenderingContext} gl - WebGL context
   */
  constructor(gl) {
    /** @type {WebGL2RenderingContext} */
    this.gl = gl;
    
    /** @type {Map<string, CachedShader>} */
    this.cache = new Map();
    
    /** @type {Map<string, WebGLProgram>} */
    this.programs = new Map();
    
    /** @type {boolean} */
    this.debug = process.env.NODE_ENV === 'development';
  }

  /**
   * Load shader from source code (auto-detects format)
   * @param {string} name - Shader identifier
   * @param {string|{vs: string, fs: string}} source - Shader source(s)
   * @returns {CachedShader}
   */
  load(name, source) {
    // Check cache first
    if (this.cache.has(name)) {
      return this.cache.get(name);
    }

    let shader;

    if (typeof source === 'string') {
      // Single source - could be PXSL (combined) or needs separate files
      if (PXSLTranspiler.isPXSL(source)) {
        // PXSL format - transpile
        shader = this.loadPXSL(name, source);
      } else {
        throw new Error(`ShaderManager: Single source must be PXSL format. Use {vs, fs} for separate GLSL.`);
      }
    } else if (source.vs && source.fs) {
      // Separate vertex and fragment shaders
      shader = this.loadGLSL(name, source.vs, source.fs);
    } else {
      throw new Error(`ShaderManager: Invalid source format for shader "${name}"`);
    }

    this.cache.set(name, shader);
    return shader;
  }

  /**
   * Load and transpile PXSL shader
   * @param {string} name - Shader name
   * @param {string} source - PXSL source code
   * @returns {CachedShader}
   */
  loadPXSL(name, source) {
    try {
      const result = PXSLTranspiler.transpile(source);
      
      if (this.debug) {
        console.log(`[ShaderManager] Transpiled PXSL shader "${result.name || name}"`);
      }

      return {
        name: result.name || name,
        vs: result.vs,
        fs: result.fs,
        timestamp: Date.now(),
        format: 'pxsl',
      };
    } catch (error) {
      throw new Error(`PXSL Transpilation Error in "${name}": ${error.message}`);
    }
  }

  /**
   * Load GLSL shaders directly
   * @param {string} name - Shader name
   * @param {string} vs - Vertex shader source
   * @param {string} fs - Fragment shader source
   * @returns {CachedShader}
   */
  loadGLSL(name, vs, fs) {
    return {
      name,
      vs,
      fs,
      timestamp: Date.now(),
      format: 'glsl',
    };
  }

  /**
   * Compile a cached shader into a WebGL program
   * @param {string} name - Shader name
   * @returns {WebGLProgram}
   */
  compile(name) {
    // Check if already compiled
    if (this.programs.has(name)) {
      return this.programs.get(name);
    }

    const shader = this.cache.get(name);
    if (!shader) {
      throw new Error(`ShaderManager: Shader "${name}" not loaded`);
    }

    const program = this.createProgram(shader.vs, shader.fs, name);
    this.programs.set(name, program);
    
    return program;
  }

  /**
   * Load and compile shader in one step
   * @param {string} name - Shader name
   * @param {string|{vs: string, fs: string}} source - Shader source
   * @returns {WebGLProgram}
   */
  loadAndCompile(name, source) {
    this.load(name, source);
    return this.compile(name);
  }

  /**
   * Create a WebGL shader program from source
   * @param {string} vsSource - Vertex shader source
   * @param {string} fsSource - Fragment shader source
   * @param {string} name - Shader name (for error messages)
   * @returns {WebGLProgram}
   */
  createProgram(vsSource, fsSource, name = 'unnamed') {
    const { gl } = this;

    // Compile vertex shader
    const vertexShader = this.compileShader(gl.VERTEX_SHADER, vsSource, `${name}.vert`);
    
    // Compile fragment shader
    const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fsSource, `${name}.frag`);

    // Create program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Shader link error in "${name}": ${log}`);
    }

    // Clean up individual shaders (they're now part of the program)
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    // Auto-detect and store attribute/uniform locations
    this.introspectProgram(program);

    return program;
  }

  /**
   * Compile a single shader
   * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
   * @param {string} source - Shader source code
   * @param {string} name - Shader name for errors
   * @returns {WebGLShader}
   */
  compileShader(type, source, name) {
    const { gl } = this;
    const shader = gl.createShader(type);
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      
      // Add line numbers to source for debugging
      const numberedSource = source.split('\n')
        .map((line, i) => `${(i + 1).toString().padStart(3)}: ${line}`)
        .join('\n');
      
      throw new Error(
        `Shader compile error in "${name}":\n${log}\n\nSource:\n${numberedSource}`
      );
    }

    return shader;
  }

  /**
   * Introspect a program to find all attributes and uniforms
   * @param {WebGLProgram} program - The compiled program
   */
  introspectProgram(program) {
    const { gl } = this;

    // Get active attributes
    const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    program._attributes = {};
    
    for (let i = 0; i < numAttribs; i++) {
      const info = gl.getActiveAttrib(program, i);
      const location = gl.getAttribLocation(program, info.name);
      program._attributes[info.name] = { location, type: info.type, size: info.size };
      program[info.name] = location;
    }

    // Get active uniforms
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    program._uniforms = {};
    
    for (let i = 0; i < numUniforms; i++) {
      const info = gl.getActiveUniform(program, i);
      // Handle array uniforms (name ends with [0])
      const baseName = info.name.replace(/\[0\]$/, '');
      const location = gl.getUniformLocation(program, info.name);
      program._uniforms[baseName] = { location, type: info.type, size: info.size };
      program[baseName] = location;
    }
  }

  /**
   * Get a compiled program by name
   * @param {string} name - Shader name
   * @returns {WebGLProgram|null}
   */
  get(name) {
    return this.programs.get(name) || null;
  }

  /**
   * Use a shader program
   * @param {string|WebGLProgram} nameOrProgram - Shader name or program
   */
  use(nameOrProgram) {
    const program = typeof nameOrProgram === 'string' 
      ? this.programs.get(nameOrProgram)
      : nameOrProgram;
    
    if (program) {
      this.gl.useProgram(program);
    }
  }

  /**
   * Reload a shader (for hot-reload support)
   * @param {string} name - Shader name
   * @param {string|{vs: string, fs: string}} source - New source
   * @returns {WebGLProgram}
   */
  reload(name, source) {
    // Delete old program
    const oldProgram = this.programs.get(name);
    if (oldProgram) {
      this.gl.deleteProgram(oldProgram);
      this.programs.delete(name);
    }

    // Remove from cache
    this.cache.delete(name);

    // Load and compile new version
    return this.loadAndCompile(name, source);
  }

  /**
   * Clear all cached shaders and programs
   */
  clear() {
    // Delete all programs
    for (const program of this.programs.values()) {
      this.gl.deleteProgram(program);
    }
    
    this.programs.clear();
    this.cache.clear();
  }

  /**
   * Get shader source (for debugging/editing)
   * @param {string} name - Shader name
   * @returns {CachedShader|null}
   */
  getSource(name) {
    return this.cache.get(name) || null;
  }

  /**
   * List all loaded shaders
   * @returns {string[]}
   */
  list() {
    return Array.from(this.cache.keys());
  }
}

export default ShaderManager;
