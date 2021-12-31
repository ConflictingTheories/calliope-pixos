/*                                                 *\
** ----------------------------------------------- **
**             Calliope - Site Generator   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2021 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import { Vector } from "../../utils/math/vector.jsx";
import Resources from "../../utils/resources.jsx";
import Sprite from "../../core/sprite.jsx";

export default class Fireplace extends Sprite {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.src = Resources.artResourceUrl("room.gif");
    this.sheetSize = [256, 256];
    this.tileSize = [48, 80];
    this.fixed = true;
    // Frames
    this.frames = {
      up: [
        [160, 80]
      ],
    };
    this.drawOffset = new Vector(0, 1.8, 0.001);
    this.hotspotOffset = new Vector(0.5, 0.5, 0);
  }
}
