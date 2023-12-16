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

import { Vector } from '@Engine/utils/math/vector.jsx';
import AirElemental from '@Sprites/monsters/air_elemental.jsx';
import { ActionLoader } from '@Engine/utils/loaders/index.jsx';
export default class MyAirElemental extends AirElemental {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
  }
  // hook init
  async interact(sprite, finish) {
    try {
      await this.zone.moveSprite(this.id, [10, 11, this.zone.getHeight(10, 11)], false);
      if (finish) finish(true);
    } catch (e) {
      console.log('error', e);
    }
  }
  // hook init
  init() {
    let ret = new ActionLoader(this.engine, 'patrol', [this.pos.toArray(), [7, 7, this.zone.getHeight(7, 7)], 200, this.zone], this, (x) => {
    });
    this.addAction(ret);
  }
}
