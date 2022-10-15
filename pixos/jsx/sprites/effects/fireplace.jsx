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
import Resources from '@Engine/utils/resources.jsx';
import AnimatedSprite from './base/animatedSprite.jsx';

export default class Fireplace extends AnimatedSprite {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.src = Resources.artResourceUrl('room.gif');
    this.sheetSize = [256, 256];
    this.tileSize = [48, 32];
    this.fixed = true;
    // Frames
    this.frames = {
      up: [
        [0, 144],
        [48, 144],
        [0, 176],
        [48, 176],
      ],
    };
    this.drawOffset = new Vector(0, 1.8, 0.001);
    this.hotspotOffset = new Vector(0.5, 0.5, 0);
    this.frameTime = 150;
  }
  // Initialize
  init() {
    this.triggerTime = 1000;
  }
}
