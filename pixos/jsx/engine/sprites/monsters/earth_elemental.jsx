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

import { Vector } from "../../../engine/utils/math/vector.jsx";
import Resources from "../../../engine/utils/resources.jsx";
import Sprite from "../../../engine/sprite.jsx";

export default class EarthElemental extends Sprite {
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
        [0, 54],
        [16, 54],
        [32, 54],
        [48, 54],
      ],
      right: [
        [0, 72],
        [16, 72],
        [32, 72],
        [16, 72],
      ],
      down: [
        [0, 90],
        [16, 90],
        [32, 90],
        [16, 90],
      ],
      left: [
        [48, 54],
        [48, 72],
        [48, 90],
        [48, 72],
      ],
    };
    // Should the camera follow the player?
    this.bindCamera = false;
    // enable speech
    this.enableSpeech = true;
    // Interaction Management
    this.state = "intro";
  }
}
