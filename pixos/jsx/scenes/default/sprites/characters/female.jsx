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

import { Vector } from "@Engine/utils/math/vector.jsx";
import Resources from "@Engine/utils/resources.jsx";
import Avatar from "@Engine/core/avatar.jsx";
export default class Default extends Avatar {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    // PROPERTIES
    this.src = Resources.artResourceUrl("player-2.gif");
    this.portraitSrc = Resources.artResourceUrl("witch_portrait.gif");
    this.sheetSize = [128, 256];
    this.tileSize = [24, 32];
    this.state = "intro";
    // Frames
    this.frames = {
      up: [
        [0, 0],
        [24, 0],
        [48, 0],
        [24, 0],
      ],
      right: [
        [0, 32],
        [24, 32],
        [48, 32],
        [24, 32],
      ],
      down: [
        [0, 64],
        [24, 64],
        [48, 64],
        [24, 64],
      ],
      left: [
        [0, 96],
        [24, 96],
        [48, 96],
        [24, 96],
      ],
    };
    // Offsets
    this.drawOffset = new Vector(-0.25, 1, 0.125);
    this.hotspotOffset = new Vector(0.5, 0.5, 0);
    // Should the camera follow the avatar?
    this.bindCamera = true;
    this.enableSpeech = true; // speech bubble
  }
}
