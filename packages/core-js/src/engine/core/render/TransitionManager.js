/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import { fetchTransitionShaderFiles } from './shaders.js';

/**
 * TransitionManager - Manages screen transitions (fade, cross, swirl, etc.).
 * Extracted from RenderManager to improve separation of concerns.
 */
export default class TransitionManager {
  /**
   * Creates an instance of TransitionManager.
   * @param {import('./manager.js').default} renderManager - The render manager instance.
   */
  constructor(renderManager) {
    /** @type {import('./manager.js').default} */
    this.renderManager = renderManager;
    /** @type {import('../index.js').default} */
    this.engine = renderManager.engine;

    /** @type {boolean} */
    this.isTransitioning = false;
    /** @type {string|null} */
    this.transitionEffect = null;
    /** @type {'out'|'in'} */
    this.transitionDirection = 'out';
    /** @type {number} */
    this.transitionDuration = 0;
    /** @type {number} */
    this.transitionStartTime = 0;
    /** @type {function(): void|null} */
    this.transitionCallback = null;
    /** @type {Object.<string, {program: WebGLProgram, buffer: WebGLBuffer, uProgress: WebGLUniformLocation, uDirection: WebGLUniformLocation}>} */
    this.transitionGL = {};
  }

  /**
   * Begins a screen transition.
   * @param {{effect?: string, direction?: 'out'|'in', duration?: number}} params - Transition parameters.
   * @returns {Promise<void>} Resolves when the transition has completed.
   */
  start(params = {}) {
    const { effect = 'fade', direction = 'out', duration = 1000 } = params;
    
    const schedule = () => {
      this.isTransitioning = true;
      this.transitionEffect = effect;
      this.transitionDirection = direction;
      this.transitionDuration = duration;
      this.transitionStartTime = performance.now();
      return new Promise((resolve) => {
        this.transitionCallback = resolve;
      });
    };

    if (this.isTransitioning) {
      const prevCallback = this.transitionCallback;
      return new Promise((resolve) => {
        this.transitionCallback = () => {
          prevCallback?.();
          schedule().then(resolve);
        };
      });
    }

    return schedule();
  }

  /**
   * Updates an in-progress transition. Should be called once per frame.
   * @returns {void}
   */
  update() {
    if (!this.isTransitioning) {
      return;
    }

    const now = performance.now();
    let progress = (now - this.transitionStartTime) / this.transitionDuration;
    if (progress >= 1.0) {
      progress = 1.0;
    }

    this.render(progress);

    if (progress >= 1.0) {
      this.isTransitioning = false;
      const cb = this.transitionCallback;
      this.transitionCallback = null;
      cb && cb();
    }
  }

  /**
   * Renders the transition overlay.
   * @param {number} progress - Progress value between 0 and 1.
   * @returns {void}
   */
  render(progress) {
    if (!this.engine.spritz.loaded) return;

    const gl = this.engine.gl;
    const effect = this.transitionEffect || 'fade';

    this.initProgram(effect);
    const trans = this.transitionGL[effect];
    if (!trans) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Transition effect "${effect}" program not found.`);
      }
      return;
    }

    // Save WebGL state
    const depthEnabled = gl.isEnabled(gl.DEPTH_TEST);
    const blendEnabled = gl.isEnabled(gl.BLEND);
    const prevBlendSrc = gl.getParameter(gl.BLEND_SRC_RGB);
    const prevBlendDst = gl.getParameter(gl.BLEND_DST_RGB);

    // Draw the quad
    gl.useProgram(trans.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, trans.buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.uniform1f(trans.uProgress, progress);
    gl.uniform1i(trans.uDirection, this.transitionDirection === 'out' ? 1 : 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Restore WebGL state
    if (depthEnabled) gl.enable(gl.DEPTH_TEST);
    if (!blendEnabled) gl.disable(gl.BLEND);
    gl.blendFunc(prevBlendSrc, prevBlendDst);

    gl.disableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.useProgram(null);
  }

  /**
   * Compiles and caches a transition shader program.
   * @param {string} effect - Name of the transition effect.
   * @returns {void}
   */
  initProgram(effect) {
    const gl = this.engine.gl;
    if (this.transitionGL[effect]) return;

    let effectName = effect;
    if (effectName.startsWith('fade')) {
      effectName = 'fade';
    }

    const [vsSource, fsSource] = fetchTransitionShaderFiles(effectName);

    const vertexShader = this.renderManager.loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.renderManager.loadShader(gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Could not link transition shader program for effect "${effect}": ${gl.getProgramInfoLog(program)}`);
    }

    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    const vertices = new Float32Array([
      -1.0, -1.0,
      -1.0, 1.0,
      1.0, -1.0,
      1.0, 1.0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const uProgress = gl.getUniformLocation(program, 'uProgress');
    const uDirection = gl.getUniformLocation(program, 'uDirection');

    this.transitionGL[effect] = {
      program: program,
      buffer: quadBuffer,
      uProgress: uProgress,
      uDirection: uDirection,
    };

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  }

  /**
   * Stops the current transition immediately.
   * @returns {void}
   */
  stop() {
    this.isTransitioning = false;
    const cb = this.transitionCallback;
    this.transitionCallback = null;
    cb && cb();
  }
}
