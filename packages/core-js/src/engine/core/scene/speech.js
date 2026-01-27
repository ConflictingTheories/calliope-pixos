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

/**
 * @fileoverview Speech class for Pixos game engine.
 * Handles speech bubbles and text rendering.
 */

import ActionQueue from '@Engine/core/queue/index.js';
import { textScrollBox } from '@Engine/core/hud/index.js';

/**
 * @typedef {object} SpeechOptions
 * @property {boolean} [portrait] - Whether to include a portrait.
 */

/**
 * Speech - Handles speech bubbles and positioned text.
 */
export default class Speech {
  /**
   * Creates an instance of Speech.
   * @param {HTMLCanvasElement} canvas - The canvas element.
   * @param {import('../index.js').default} engine - The game engine instance.
   * @param {string} id - The speech ID.
   */
  constructor(canvas, engine, id) {
    /** @type {string} */
    this.id = id;
    /** @type {import('../index.js').default} */
    this.engine = engine;
    /** @type {HTMLCanvasElement} */
    this.canvas = canvas;
    /** @type {CanvasRenderingContext2D} */
    this.ctx = canvas.getContext('2d');
    /** @type {WebGLTexture} */
    this.glTexture = engine.gl.createTexture();
    /** @type {boolean} */
    this.loaded = false;
    /** @type {ActionQueue} */
    this.onLoadActions = new ActionQueue();
    this.loadImage();
  }

  /**
   * Runs an action when loaded or adds to queue.
   * @param {function(): void} action - The action to run.
   */
  runWhenLoaded = action => {
    if (this.loaded) action();
    else this.onLoadActions.add(action);
  };

  /**
   * Loads the texture from the canvas.
   */
  loadImage = () => {
    let { gl } = this.engine;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    this.loaded = true;
    this.onLoadActions.run();
  };

  /**
   * Binds the texture to the uniform.
   */
  attach = () => {
    let { gl } = this.engine;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.uniform1i(this.engine.renderManager.shaderProgram.samplerUniform, 0);
  };

  /**
   * Clears the HUD overlay.
   */
  clearHud = () => {
    const { ctx } = this;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.loadImage();
  };

  /**
   * Writes text to the HUD.
   * @param {string} text - The text to write.
   * @param {number} [x] - The x position.
   * @param {number} [y] - The y position.
   */
  writeText = (text, x, y) => {
    const { ctx } = this;
    ctx.save();
    ctx.font = '32px minecraftia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(text, x ?? ctx.canvas.width / 2, y ?? ctx.canvas.height / 2);
    ctx.restore();
  };

  /**
   * Creates a scrolling textbox.
   * @param {string} text - The text to display.
   * @param {boolean} [scrolling=false] - Whether to scroll.
   * @param {SpeechOptions} [options={}] - Additional options.
   * @returns {textScrollBox} The textbox instance.
   */
  scrollText = (text, scrolling = false, options = {}) => {
    let txt = new textScrollBox(this.ctx);
    if (options.portrait) {
      txt.init(
        text,
        10,
        10,
        this.canvas.width - 20 - 84,
        (2 * this.canvas.height) / 3 - 20,
        options
      );
    } else {
      txt.init(text, 10, 10, this.canvas.width - 20, (2 * this.canvas.height) / 3 - 20, options);
    }
    txt.setOptions(options);
    if (scrolling) {
      txt.scroll((Math.sin(new Date().getTime() / 3000) + 1) * txt.maxScroll * 0.5);
    }
    txt.render();
    return txt;
  };
}
