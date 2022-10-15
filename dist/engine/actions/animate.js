"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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
// Animate a sprite without moving them
var _default = {
  init: function init(length, untilFrame, finish) {
    this.length = length;
    this.untilFrame = untilFrame;
    this.finish = finish;
  },
  tick: function tick(time) {
    if (!this.loaded) return; // Set facing

    if (this.facing && this.facing != this.sprite.facing) this.sprite.setFacing(this.facing); // Transition & Move

    var endTime = this.startTime + this.length;
    var frac = (time - this.startTime) / this.length;

    if (time >= endTime) {
      frac = 1;
      if (this.finish) this.finish(true);
    } // Get next frame


    var newFrame = Math.floor(frac * this.untilFrame);
    if (newFrame != this.sprite.animFrame) this.sprite.setFrame(newFrame);
    return time >= endTime;
  }
};
exports["default"] = _default;