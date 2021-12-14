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

import ActionQueue from "./queue.jsx";
import { textScrollBox } from "./hud.jsx";
export default class Speech {
  constructor(canvas, engine, id) {
    this.id = id;
    this.engine = engine;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.glTexture = engine.gl.createTexture();
    this.loaded = false;
    this.onLoadActions = new ActionQueue();
    this.loadImage();
  }

  runWhenLoaded(action) {
    if (this.loaded) action();
    else this.onLoadActions.add(action);
  }

  // Load Texture from Image
  loadImage() {
    let { gl } = this.engine;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas); // This is the important line!
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    console.log("loading canvas ", this.canvas);
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

  // clear HUD overlay
  clearHud() {
    const { ctx } = this;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.loadImage();
  }

  // Write Text to HUD
  writeText(text, x, y) {
    const { ctx } = this;
    ctx.save();
    ctx.font = "32px minecraftia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.fillText(text, x ?? ctx.canvas.width / 2, y ?? ctx.canvas.height / 2);
    ctx.restore();
  }

  // Scrolling Textbox
  scrollText(text, scrolling = false, options = {}) {
    let txt = new textScrollBox(this.ctx);
    if (options.portrait) {
      txt.init(text, 10, 10, this.canvas.width - 20 - 84, (2 * this.canvas.height) / 3 - 20, options);
    } else {
      txt.init(text, 10, 10, this.canvas.width - 20, (2 * this.canvas.height) / 3 - 20, options);
    }
    txt.setOptions(options);
    if (scrolling) {
      txt.scroll((Math.sin(new Date().getTime() / 3000) + 1) * txt.maxScroll * 0.5); // default oscillate
    }
    txt.render();
    return txt;
  }
}
