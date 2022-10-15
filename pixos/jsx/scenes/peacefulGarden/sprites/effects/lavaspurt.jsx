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

import Spurt from '@Sprites/effects/spurt.jsx';
import Resources from '@Engine/utils/resources.jsx';
export default class LavaSpurt extends Spurt {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.src = Resources.artResourceUrl('tileset.png');
    this.sheetSize = [512, 512];
    this.tileSize = [16, 16];
    // Frames
    this.frames = {
      up: [
        [0, 416],
        [16, 416],
        [32, 416],
        [48, 416],
        [64, 416],
        [80, 416],
      ],
    };
  }
}
