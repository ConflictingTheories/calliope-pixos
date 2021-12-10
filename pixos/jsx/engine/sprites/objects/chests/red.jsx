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

export default class RedChest extends Sprite {
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
        [64, 0],
        [64, 48],
        [64, 96],
        [64, 144],
      ],
      left: [
        [192, 0],
        [192, 48],
        [192, 96],
        [192, 144],
      ],
      down: [
        [64, 192],
        [64, 240],
        [64, 320],
        [64, 336],
      ],
      right: [
        [320, 0],
        [320, 48],
        [320, 96],
        [320, 144],
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
