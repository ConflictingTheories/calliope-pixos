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

import { translate, rotate } from '@Engine/utils/math/matrix4.jsx';
import Sprite from '@Engine/core/sprite.jsx';
import { Vector } from '@Engine/utils/math/vector.jsx';

export default class AnimatedSprite extends Sprite {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.enableSpeech = false;
    this.lastTime = 0;
    this.accumTime = 0;
    this.triggerTime = 400;
    this.frameTime = 250;
  }
  // Initialize
  init() {
    this.triggerTime = 1000 + Math.floor(Math.random() * 5000);
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
    if (this.animFrame == 5) {
      this.setFrame(0);
      this.triggerTime = 1000 + Math.floor(Math.random() * 4000);
    } else {
      this.setFrame(this.animFrame + 1);
      this.accumTime = 0;
      this.lastTime = time;
    }
  }
}
