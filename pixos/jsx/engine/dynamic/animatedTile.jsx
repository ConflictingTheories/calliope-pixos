/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2023 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import { translate, rotate } from '@Engine/utils/math/matrix4.jsx';
import DynamicSprite from '@Engine/dynamic/sprite.jsx';
import { degToRad } from '../utils/math/vector.jsx';

export default class DynamicAnimatedTile extends DynamicSprite {
  constructor(engine, json, zip) {
    // Initialize Sprite
    super(engine, json, zip);
  }

  // setup framerate
  init() {
    if (this.json.randomJitter) {
      this.triggerTime = this.json.triggerTime + Math.floor(Math.random() * this.json.randomJitter);
    } else {
      this.triggerTime = this.json.triggerTime;
    }
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
    engine.renderManager.mvPushMatrix();
    translate(engine.camera.uViewMat, engine.camera.uViewMat, this.pos.toArray());
    // Lie flat on the ground
    translate(engine.camera.uViewMat, engine.camera.uViewMat, (this.drawOffset[engine.camera.cameraDir] ?? this.drawOffset['N']).toArray());
    rotate(engine.camera.uViewMat, engine.camera.uViewMat, degToRad(90), [1, 0, 0]);
    engine.renderManager.bindBuffer(this.vertexPosBuf, engine.renderManager.shaderProgram.aVertexPosition);
    engine.renderManager.bindBuffer(this.vertexTexBuf, engine.renderManager.shaderProgram.aTextureCoord);
    this.texture.attach();
    // Draw
    engine.renderManager.shaderProgram.setMatrixUniforms();
    engine.gl.drawArrays(engine.gl.TRIANGLES, 0, this.vertexPosBuf.numItems);
    engine.renderManager.mvPopMatrix();
  }
}
