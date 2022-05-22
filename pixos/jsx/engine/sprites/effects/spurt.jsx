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

import { Vector } from "@Engine/utils/math/vector.jsx";
import Resources from "@Engine/utils/resources.jsx";
import AnimatedTile from "./base/animatedTile.jsx";

export default class Spurt extends AnimatedTile {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.src = Resources.artResourceUrl("sewer.gif");
    this.sheetSize = [256, 256];
    this.tileSize = [16, 16];
    // Frames
    this.frames = {
      up: [
        [0, 144],
        [16, 144],
        [32, 144],
        [48, 144],
        [64, 144],
        [80, 144],
      ],
    };
    this.drawOffset = new Vector(0, 1, 0.001);
    this.hotspotOffset = new Vector(0.5, 0.5, 0);
    this.frameTime = 150;
  }
  // Initialize
  init() {
    this.triggerTime = 1000 + Math.random() * 5000;
  }
}
