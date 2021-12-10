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

import { Vector } from "../../../../engine/utils/math/vector.jsx";
import Resources from "../../../../engine/utils/resources.jsx";
import Sprite from "../../../../engine/core/sprite.jsx";

export default class Chest extends Sprite {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    // Character art from http://opengameart.org/content/chara-seth-scorpio
    this.src = Resources.artResourceUrl("chests.gif");
    this.sheetSize = [512, 512];
    this.tileSize = [32, 48];
    // Offsets
    this.drawOffset = new Vector(0, 1, 0.2);
    this.hotspotOffset = new Vector(0.5, 0.5, 0);
    // Frames & Faces
    this.frames = {
      up: [
        [0, 0],
        [0, 48],
        [0, 96],
        [0, 144],
      ],
      left: [
        [128, 0],
        [128, 48],
        [128, 96],
        [128, 144],
      ],
      down: [
        [0, 192],
        [0, 240],
        [0, 288],
        [0, 336],
      ],
      right: [
        [256, 0],
        [256, 48],
        [256, 96],
        [256, 144],
      ],
    };
    // Should the camera follow the avatar?
    this.bindCamera = false;
    // enable speech
    this.enableSpeech = true;
    // Interaction Management
    this.state = "closed";
  }
}
