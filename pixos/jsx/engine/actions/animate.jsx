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
// Animate a sprite without moving them
export default {
  init: function (length, untilFrame, finish) {
    console.log({msg: 'initializing animation', length, untilFrame, finish});
    this.length = length;
    this.untilFrame = untilFrame;
    this.finish = finish;
  },
  tick: function (time) {
    if (!this.loaded) return;
    // Set facing
    if (this.facing && this.facing != this.sprite.facing) this.sprite.setFacing(this.facing);
    // Transition & Move
    let endTime = this.startTime + this.length;
    let frac = (time - this.startTime) / this.length;
    if (time >= endTime) {
      frac = 1;
      if (this.finish) this.finish(true);
    }
    // Get next frame
    let newFrame = Math.floor(frac * this.untilFrame);
    if (newFrame != this.sprite.animFrame) this.sprite.setFrame(newFrame);

    return time >= endTime;
  },
};
