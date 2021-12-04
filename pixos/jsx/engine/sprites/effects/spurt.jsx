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

import { Vector } from "../../utils/math/vector.jsx";
import { translate, rotate } from "../../utils/math/matrix4.jsx";
import Resources from "../../utils/resources.jsx";
import Sprite from "../../sprite.jsx";

export default class Spurt extends Sprite {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.src = Resources.artResourceUrl("sewer.gif");
    this.sheetSize = [256, 256];
    this.tileSize = [16, 16];
    // Frames
    this.frames = {
      up: [
        [0, 144],
        [16, 144],
        [32, 144],
        [48, 144],
        [64, 144],
        [80, 144],
      ],
    };
    this.enableSpeech = false;
    this.drawOffset = new Vector(0, 1, 0.001);
    this.hotspotOffset = new Vector(0.5, 0.5, 0);
    this.lastTime = 0;
    this.accumTime = 0;
    this.blowTime = 0;
    this.frameTime = 150;
  }
  // Initialize
  init() {
    this.blowTime = 1000 + Math.random() * 5000;
  }
  // Update each frame
  tick(time) {
    if (this.lastTime == 0) {
      this.lastTime = time;
      return;
    }
    // wait enough time
    this.accumTime += time - this.lastTime;
    if (this.accumTime < this.frameTime || (this.animFrame == 0 && this.accumTime < this.blowTime)) return;
    // reset animation
    if (this.animFrame == 5) {
      this.setFrame(0);
      this.blowTime = 1000 + Math.random() * 4000;
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
