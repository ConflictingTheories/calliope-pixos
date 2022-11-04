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

import { Vector, set, lerp } from '@Engine/utils/math/vector.jsx';
import { Direction } from '@Engine/utils/enums.jsx';

export default {
  init: function (from, to, length, zone) {
    this.zone = zone;
    this.from = new Vector(...from);
    this.to = new Vector(...to);
    this.facing = Direction.fromOffset([Math.round(to.x - from.x), Math.round(to.y - from.y)]);
    this.length = length;
    // interactions
    console.log(this.zone);
    this.spriteList = this.zone.spriteList.filter((sprite) => sprite.pos.x === this.to.x && sprite.pos.y === this.to.y);
  },
  // move
  tick: function (time) {
    if (!this.loaded) return;
    // Set facing
    if (this.facing && this.facing != this.sprite.facing) this.sprite.setFacing(this.facing);
    // Transition & Move
    let endTime = this.startTime + this.length;
    let frac = (time - this.startTime) / this.length;
    if (time >= endTime) {
      set(this.to, this.sprite.pos);
      frac = 1;
      this.onStep();
    } else lerp(this.from, this.to, frac, this.sprite.pos);
    // Get next frame
    let newFrame = Math.floor(frac * 4);
    if (newFrame != this.sprite.animFrame) this.sprite.setFrame(newFrame);
    // Determine height
    let hx = this.sprite.pos.x + this.sprite.hotspotOffset.x;
    let hy = this.sprite.pos.y + this.sprite.hotspotOffset.y;
    this.sprite.pos.z = this.sprite.zone.getHeight(hx, hy);

    return time >= endTime;
  },
  // Trigger interactions in sprite when finished moving
  onStep: function () {
    console.log('on steppping', this.spriteList);
    if (this.spriteList.length === 0) this.completed = true;
    this.spriteList.forEach((sprite) => {
      return sprite.onStep ? this.zone.spriteDict[sprite.id].onStep(this.sprite) : null;
    });
  },
};
