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

export default class AirElemental extends Sprite {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    // Character art from http://opengameart.org/content/chara-seth-scorpio
    this.src = Resources.artResourceUrl("elementals-2.gif");
    this.sheetSize = [64, 128];
    this.tileSize = [16, 18];
    // Offsets
    this.drawOffset = new Vector(0, 1, 0.2);
    this.hotspotOffset = new Vector(0.5, 0.5, 0);
    // Frames & Faces
    this.frames = {
      up: [
        [0, 0],
        [16, 0],
        [32, 0],
        [48, 0],
      ],
      right: [
        [0, 18],
        [16, 18],
        [32, 18],
        [16, 18],
      ],
      down: [
        [0, 36],
        [16, 36],
        [32, 36],
        [16, 36],
      ],
      left: [
        [48, 0],
        [48, 18],
        [48, 36],
        [48, 18],
      ],
    };
    // Should the camera follow the avatar?
    this.bindCamera = false;
    // enable speech
    this.enableSpeech = true;
    // Interaction Management
    this.state = "intro";
  }
}
