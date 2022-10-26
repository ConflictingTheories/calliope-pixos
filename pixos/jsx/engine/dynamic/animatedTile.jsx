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

import { Vector } from '@Engine/utils/math/vector.jsx';
import { ActionLoader } from '@Engine/utils/loaders/index.jsx';
import DynamicSprite from '@Engine/dynamic/sprite.jsx';

export default class DynamicAnimatedTile extends DynamicSprite {
  constructor(engine, json) {
    // Initialize Sprite
    super(engine);
    // load in json
    this.loadJson(json);
    // store json config
    this.json = json;
    this.ActionLoader = ActionLoader;
  }

  // setup framerate
  init() {
    if (this.json.randomJitter) {
      this.triggerTime = this.json.triggerTime + Math.floor(Math.random() * this.json.randomJitter);
    } else {
      this.triggerTime = this.json.triggerTime;
    }
  }
}
