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

import { ActionLoader } from '@Engine/utils/loaders/index.jsx';
import DynamicSprite from '@Engine/dynamic/sprite.jsx';

export default class DynamicAnimatedSprite extends DynamicSprite {
  constructor(engine, json) {
    // Initialize Sprite
    super(engine);
    console.log('New Sprite ... sprite -->');

    // load in json
    this.loadJson(json);
    // store json config
    this.json = json;
    this.ActionLoader = ActionLoader;
  }

  // setup framerate
  init() {
    console.log('Initializing sprite -->');
    if (this.json.randomJitter) {
      this.triggerTime = this.json.triggerTime + Math.floor(Math.random() * this.json.randomJitter);
    } else {
      this.triggerTime = this.json.triggerTime;
    }
  }

  // animate sprite on ticks
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
