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

import { translate, rotate } from "../../../utils/math/matrix4.jsx";
import Sprite from "../../../core/sprite.jsx";

export default class AnimatedTile extends Sprite {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.enableSpeech = false;
    this.lastTime = 0;
    this.accumTime = 0;
    this.triggerTime = 400;
    this.frameTime = 250;
    this.blocking = false; // can passthrough
  }
  // Initialize
  init() {
    this.triggerTime = 2000 ;
  }
  // Update each frame
  tick(time) {
    if (this.lastTime == 0) {
      this.lastTime = time;
      return;
    }
    // wait enough time
    this.accumTime += time - this.lastTime;
    if (this.accumTime < this.frameTime || (this.animFrame == 0 && this.accumTime < this.triggerTime)) return;
    // reset animation
    if (this.animFrame == 4) {
      this.setFrame(0);
      this.triggerTime = 2000 + Math.floor(Math.random() * 4000);
    } else {
      this.setFrame(this.animFrame + 1);
      this.accumTime = 0;
      this.lastTime = time;
    }
  }
  // Draw Frame
  draw(engine) {
    if (!this.loaded) return;
    engine.mvPushMatrix();
    translate(engine.uViewMat, engine.uViewMat, this.pos.toArray());
    // Lie flat on the ground
    translate(engine.uViewMat, engine.uViewMat, this.drawOffset.toArray());
    rotate(engine.uViewMat, engine.uViewMat, engine.degToRad(90), [1, 0, 0]);
    engine.bindBuffer(this.vertexPosBuf, engine.shaderProgram.vertexPositionAttribute);
    engine.bindBuffer(this.vertexTexBuf, engine.shaderProgram.textureCoordAttribute);
    this.texture.attach();
    // Draw
    engine.shaderProgram.setMatrixUniforms();
    engine.gl.drawArrays(engine.gl.TRIANGLES, 0, this.vertexPosBuf.numItems);
    engine.mvPopMatrix();
  }
}
