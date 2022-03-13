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
import Sprite from "@Engine/core/sprite.jsx";

export default class XMasTree extends Sprite {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.src = Resources.artResourceUrl("trees.png");
    this.sheetSize = [512, 512];
    this.tileSize = [96, 144];
    this.fixed = true;
    // Frames
    this.frames = {
      up: [
        [96, 160]
      ],
    };
    this.drawOffset = new Vector(-2.5, 2.15, -0.85);
    this.hotspotOffset = new Vector(0.5, 0.5, 0);
    this.blocking = true;
  }
}
