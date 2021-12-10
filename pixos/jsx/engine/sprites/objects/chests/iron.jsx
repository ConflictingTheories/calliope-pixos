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

export default class IronChest extends Sprite {
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
        [32, 0],
        [32, 48],
        [32, 96],
        [32, 144],
      ],
      left: [
        [160, 0],
        [160, 48],
        [160, 96],
        [160, 144],
      ],
      down: [
        [32, 192],
        [32, 240],
        [32, 288],
        [32, 336],
      ],
      right: [
        [288, 0],
        [288, 48],
        [288, 96],
        [288, 144],
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
