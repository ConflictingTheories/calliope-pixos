/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2022 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
import { lerp } from '@Engine/utils/math/vector.jsx';

export default {
  // Initialize Dialogue Object
  init: function (cameraAction, options = {}) {
    this.engine = this.world.engine;
    this.cameraAction = cameraAction;
    this.options = options;
    this.completed = false;
    this.startTime = new Date().getTime();
  },
  // Update & Scroll
  tick: function (time) {
    if (!this.loaded) return;
    // Check for Dialogue Completion (TODO - manual triggers + scroll / sections)
    switch (this.cameraAction) {
      case 'pan':
        let frac = (time - this.startTime) / (this.options.duration * 1000);
        let from = this.options.from;
        let to = this.options.to;
        lerp(from, to, frac, this.engine.cameraVector);
        // Pan from to
        // Then Adjust Facing Directions for Sprites
        // use lerp to smoothly transition based on completion
        break;
      case 'zoom':
        break;
      case 'focus':
        break;
      case 'translate':
        break;
      default:
        break;
    }

    if (this.options && this.options.duration) {
      this.endTime = this.endTime ? this.endTime : this.options.endTime ?? new Date().getTime() + this.options.duration * 1000; // 10 seconds default if autoclose
      if (time > this.endTime) {
        this.completed = true;
      }
    }

    return this.completed;
  },
};
