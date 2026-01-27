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

import { translate, rotate } from '@Engine/utils/math/matrix4.js';
import DynamicSprite from '@Engine/dynamic/sprite.js';
import { degToRad } from '../utils/math/vector.js';

/**
 * DynamicAnimatedTile - A dynamic tile with animation capabilities.
 */
export default class DynamicAnimatedTile extends DynamicSprite {
  /**
   * Creates an instance of DynamicAnimatedTile.
   * @param {GLEngine} engine - The game engine instance.
   * @param {Object} json - The JSON configuration.
   * @param {Object} zip - The zip file data.
   */
  constructor(engine, json, zip) {
    // Initialize Sprite
    super(engine, json, zip);
  }

  /**
   * Initializes the animated tile, setting up framerate.
   */
  init = () => {
    if (this.json.randomJitter) {
      this.triggerTime = this.json.triggerTime + Math.floor(Math.random() * this.json.randomJitter);
    } else {
      this.triggerTime = this.json.triggerTime;
    }
  };

  /**
   * Updates the tile each frame.
   * @param {number} time - The current time.
   */
  tick = time => {
    if (this.lastTime == 0) {
      this.lastTime = time;
      return;
    }
    // wait enough time
    this.accumTime += time - this.lastTime;
    if (
      this.accumTime < this.frameTime ||
      (this.animFrame == 0 && this.accumTime < this.triggerTime)
    )
      return;
    // reset animation
    if (this.animFrame == 4) {
      this.setFrame(0);
      this.triggerTime = 2000 + Math.floor(Math.random() * 4000);
    } else {
      this.setFrame(this.animFrame + 1);
      this.accumTime = 0;
      this.lastTime = time;
    }
  };

  /**
   * Draws the tile frame.
   * @param {GLEngine} engine - The game engine instance.
   */
  draw = engine => {
    if (!this.loaded) return;
    const rm = engine.renderManager;
    const isPickerPass = rm.isPickerPass;

    rm.mvPushMatrix();
    translate(rm.uModelMat, rm.uModelMat, this.pos.toArray());
    // Lie flat on the ground
    translate(
      rm.uModelMat,
      rm.uModelMat,
      (this.drawOffset[rm.camera.cameraDir] ?? this.drawOffset['N']).toArray()
    );
    rotate(rm.uModelMat, rm.uModelMat, degToRad(90), [1, 0, 0]);
    rm.bindBuffer(this.vertexPosBuf, rm.shaderProgram.aVertexPosition);
    rm.bindBuffer(this.vertexTexBuf, rm.shaderProgram.aTextureCoord);
    this.texture.attach();

    // Draw - set uniforms based on render pass
    if (isPickerPass) {
      rm.effectPrograms['picker'].setMatrixUniforms({ id: this.getPickingId() });
    } else {
      rm.shaderProgram.setMatrixUniforms({ id: this.getPickingId() });
    }
    engine.gl.drawArrays(engine.gl.TRIANGLES, 0, this.vertexPosBuf.numItems);
    rm.mvPopMatrix();
  };
}
