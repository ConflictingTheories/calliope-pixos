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

import DynamicSprite from '@Engine/dynamic/sprite.js';
import { Direction } from '@Engine/utils/enums.js';

/**
 * DynamicAnimatedSprite - A dynamic sprite with animation capabilities.
 */
export default class DynamicAnimatedSprite extends DynamicSprite {
  /**
   * Creates an instance of DynamicAnimatedSprite.
   * @param {GLEngine} engine - The game engine instance.
   * @param {Object} json - The JSON configuration.
   * @param {Object} zip - The zip file data.
   */
  constructor(engine, json, zip) {
    // Initialize Sprite
    super(engine, json, zip);
  }

  /**
   * Initializes the animated sprite, setting up framerate.
   */
  init = () => {
    // Initialize timing variables for animation loop
    this.lastTime = 0;
    this.accumTime = 0;
    // frameTime = milliseconds per frame. Default: 100ms = 10 FPS
    this.frameTime = this.json.frameTime ?? 100;
    // triggerTime = delay before first animation loop starts
    if (this.json.randomJitter) {
      this.triggerTime = this.json.triggerTime + Math.floor(Math.random() * this.json.randomJitter);
    } else {
      this.triggerTime = this.json.triggerTime ?? 1000; // Default: 1 second
    }
  };

  /**
   * Animates the sprite on ticks.
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
    ) {
      this.lastTime = time;
      return;
    }
    
    // Get the frame count for current facing direction
    const sequence = Direction.spriteSequence(
      this.facing,
      this.engine.renderManager.camera.cameraDir
    );
    const frames = this.frames[sequence] ?? this.frames['N'];
    const maxFrame = frames.length - 1;
    
    // reset animation
    if (this.animFrame >= maxFrame) {
      this.setFrame(0);
      this.triggerTime = 1000 + Math.floor(Math.random() * 4000);
    } else {
      this.setFrame(this.animFrame + 1);
    }
    this.accumTime = 0;
    this.lastTime = time;
  };
}
