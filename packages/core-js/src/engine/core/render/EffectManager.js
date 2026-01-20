/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import effects from '../../shaders/effects/index.js';

/**
 * EffectManager - Manages post-processing effects and their framebuffers.
 */
export default class EffectManager {
    /**
     * @param {import('./manager.js').default} renderManager - Reference to the RenderManager.
     */
    constructor(renderManager) {
        this.renderManager = renderManager;
        this.engine = renderManager.engine;
        this.gl = this.engine.gl;

        /** @type {Object.<string, WebGLProgram>} */
        this.programs = {};
        /** @type {string[]} */
        this.activeEffects = [];

        /** @type {WebGLFramebuffer|null} */
        this.sceneFBO = null;
        /** @type {WebGLTexture|null} */
        this.sceneTexture = null;
        /** @type {WebGLRenderbuffer|null} */
        this.sceneDepthBuffer = null;

        /** @type {WebGLFramebuffer|null} */
        this.pingPongFBO = null;
        /** @type {WebGLTexture|null} */
        this.pingPongTexture = null;

        /** @type {WebGLBuffer|null} */
        this.quadBuffer = null;

        /** @type {number} */
        this.width = 0;
        /** @type {number} */
        this.height = 0;
    }

    /**
     * Initializes the effect manager, creating framebuffers and compiling default effects.
     */
    init() {
        const gl = this.gl;
        this.width = gl.canvas.width;
        this.height = gl.canvas.height;

        this._setupFramebuffers();
        this._setupQuadBuffer();
        this._initEffects();
    }

    /**
     * Sets up the framebuffers for off-screen rendering.
     * @private
     */
    _setupFramebuffers() {
        const gl = this.gl;
        const { width, height } = this;

        // Cleanup existing if resizing
        if (this.sceneFBO) gl.deleteFramebuffer(this.sceneFBO);
        if (this.sceneTexture) gl.deleteTexture(this.sceneTexture);
        if (this.sceneDepthBuffer) gl.deleteRenderbuffer(this.sceneDepthBuffer);
        if (this.pingPongFBO) gl.deleteFramebuffer(this.pingPongFBO);
        if (this.pingPongTexture) gl.deleteTexture(this.pingPongTexture);

        // Create scene FBO
        this.sceneFBO = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFBO);

        // Create color texture
        this.sceneTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.sceneTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.sceneTexture, 0);

        // Create depth renderbuffer
        this.sceneDepthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.sceneDepthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.sceneDepthBuffer);

        // Create ping-pong FBO
        this.pingPongFBO = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.pingPongFBO);

        this.pingPongTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.pingPongTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.pingPongTexture, 0);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.error('Ping-pong FBO is incomplete');
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /**
     * Sets up a full-screen quad buffer.
     * @private
     */
    _setupQuadBuffer() {
        const gl = this.gl;
        this.quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        const vertices = new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    }

    /**
     * Compiles and initializes all shaders in the effects library.
     * @private
     */
    _initEffects() {
        for (const [id, config] of Object.entries(effects)) {
            try {
                this.programs[id] = this._compileProgram(id, config);
            } catch (e) {
                console.error(`Failed to initialize effect "${id}":`, e);
            }
        }
    }

    /**
     * Compiles a shader program from source.
     * @param {string} id - Effect identifier.
     * @param {object} config - Effect configuration (vs, fs).
     * @returns {WebGLProgram}
     * @private
     */
    _compileProgram(id, config) {
        const gl = this.gl;
        const vertexShader = this._loadShader(gl.VERTEX_SHADER, config.vs);
        const fragmentShader = this._loadShader(gl.FRAGMENT_SHADER, config.fs);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            throw new Error(`Could not link effect program "${id}": ${info}`);
        }

        // Cache generic uniform locations
        program.uTexture = gl.getUniformLocation(program, 'uTexture');
        program.uResolution = gl.getUniformLocation(program, 'uResolution');
        program.uTime = gl.getUniformLocation(program, 'uTime');

        // Cache specific uniforms if they exist in the shader
        program.uniforms = {};
        const uniformNames = this._extractUniforms(config.fs);
        for (const name of uniformNames) {
            program.uniforms[name] = gl.getUniformLocation(program, name);
        }

        return program;
    }

    /**
     * Loads and compiles a shader.
     * @private
     */
    _loadShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Shader compile error: ${info}`);
        }
        return shader;
    }

    /**
     * Extracts uniform names from GLSL source (naive regex approach).
     * @private
     */
    _extractUniforms(source) {
        const uniforms = [];
        const regex = /uniform\s+\w+\s+(\w+);/g;
        let match;
        while ((match = regex.exec(source)) !== null) {
            uniforms.push(match[1]);
        }
        return uniforms;
    }

    /**
     * Enables a post-processing effect.
     * @param {string} effectId - The ID of the effect to enable.
     */
    enableEffect(effectId) {
        if (this.programs[effectId] && !this.activeEffects.includes(effectId)) {
            this.activeEffects.push(effectId);
        }
    }

    /**
     * Disables a post-processing effect.
     * @param {string} effectId - The ID of the effect to disable.
     */
    disableEffect(effectId) {
        this.activeEffects = this.activeEffects.filter(id => id !== effectId);
    }

    /**
     * Clears all active effects.
     */
    clearEffects() {
        this.activeEffects = [];
    }

    /**
     * Prepares the engine for scene rendering by binding the scene FBO.
     */
    beginScene() {
        if (this.activeEffects.length === 0) return;
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFBO);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    /**
     * Completes scene rendering and applies active effects to the screen.
     * @param {number} timestamp - Current timestamp for animations.
     */
    endScene(timestamp) {
        if (this.activeEffects.length === 0) return;

        const gl = this.gl;

        let currentSource = this.sceneTexture;
        let currentDest = this.pingPongFBO;
        let currentSourceTex = this.sceneTexture;

        for (let i = 0; i < this.activeEffects.length; i++) {
            const effectId = this.activeEffects[i];
            const isLast = i === this.activeEffects.length - 1;

            // Render to screen if last, otherwise to currentDest
            gl.bindFramebuffer(gl.FRAMEBUFFER, isLast ? null : currentDest);
            gl.viewport(0, 0, this.width, this.height);

            const program = this.programs[effectId];
            if (!program) continue;

            gl.useProgram(program);

            // Bind current source texture
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, currentSourceTex);
            gl.uniform1i(program.uTexture, 0);

            // Standard uniforms
            gl.uniform2f(program.uResolution, this.width, this.height);
            gl.uniform1f(program.uTime, timestamp / 1000);

            // Effect-specific uniforms
            this._setEffectUniforms(effectId, program);

            // Draw quad
            gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
            const aPosition = gl.getAttribLocation(program, 'aPosition');
            if (aPosition >= 0) {
                gl.enableVertexAttribArray(aPosition);
                gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
            }

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            // Swap for next iteration
            if (!isLast) {
                currentSourceTex = (currentDest === this.pingPongFBO) ? this.pingPongTexture : this.sceneTexture;
                currentDest = (currentDest === this.pingPongFBO) ? this.sceneFBO : this.pingPongFBO;
            }
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /**
     * Sets effect-specific uniforms based on effect configuration.
     * @private
     */
    _setEffectUniforms(effectId, program) {
        const gl = this.gl;
        const uniforms = program.uniforms;

        // Default configuration for effects
        // In a real implementation, these would come from an EffectState object
        switch (effectId) {
            case 'crt':
                if (uniforms.uCurvature) gl.uniform1f(uniforms.uCurvature, 0.1);
                if (uniforms.uScanlines) gl.uniform1f(uniforms.uScanlines, 0.5);
                if (uniforms.uVignette) gl.uniform1f(uniforms.uVignette, 0.3);
                break;
            case 'bloom':
                if (uniforms.uThreshold) gl.uniform1f(uniforms.uThreshold, 0.7);
                if (uniforms.uIntensity) gl.uniform1f(uniforms.uIntensity, 1.0);
                if (uniforms.uRadius) gl.uniform1f(uniforms.uRadius, 2.0);
                break;
            case 'vignette':
                if (uniforms.uIntensity) gl.uniform1f(uniforms.uIntensity, 0.5);
                if (uniforms.uSoftness) gl.uniform1f(uniforms.uSoftness, 0.5);
                break;
            case 'chromaticAberration':
                if (uniforms.uAmount) gl.uniform1f(uniforms.uAmount, 0.005);
                break;
            // Add more as needed
        }
    }

    /**
     * Handles resize events by recreating framebuffers.
     */
    handleResize(width, height) {
        this.width = width;
        this.height = height;
        this._setupFramebuffers();
    }
}
