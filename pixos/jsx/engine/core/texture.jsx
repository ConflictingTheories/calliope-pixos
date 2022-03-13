/*                                                 *\
** ----------------------------------------------- **
**             Calliope - Site Generator   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2021 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import ActionQueue from "@Engine/core/queue.jsx";
export class Texture {
  constructor(src, engine) {
    this.engine = engine;
    this.src = src;
    this.glTexture = engine.gl.createTexture();
    this.image = new Image();
    this.image.onload = this.onImageLoaded.bind(this);
    this.image.src = src;
    this.loaded = false;
    this.onLoadActions = new ActionQueue();
  }

  runWhenLoaded(action) {
    if (this.loaded) action();
    else this.onLoadActions.add(action);
  }

  // Load Texture from Image
  onImageLoaded() {
    let { gl } = this.engine;
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.loaded = true;
    this.onLoadActions.run();
  }

  // Bind texture to Uniform
  attach() {
    let { gl } = this.engine;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.uniform1i(this.engine.shaderProgram.samplerUniform, 0);
  }
}

export class ColorTexture {
  constructor(color, engine) {
    this.engine = engine;
    this.color = color;
    this.glTexture = engine.gl.createTexture();
    this.loaded = false;
    this.onLoadActions = new ActionQueue();
    this.loadTexture();
  }

  runWhenLoaded(action) {
    if (this.loaded) action();
    else this.onLoadActions.add(action);
  }

  // Load Texture from Image
  loadTexture() {
    let { gl } = this.engine;
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([...this.color]);

    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
    this.loaded = true;
    this.onLoadActions.run();
  }

  // Bind texture to Uniform
  attach() {
    let { gl } = this.engine;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.uniform1i(this.engine.shaderProgram.samplerUniform, 0);
  }
}
