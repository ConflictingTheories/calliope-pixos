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
import NPC from "./base/NPC.jsx";

export default class EarthKnight extends NPC {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    // Character art from http://opengameart.org/content/chara-seth-scorpio
    this.src = Resources.artResourceUrl("earth-knight.gif");
    this.portraitSrc = Resources.artResourceUrl("earth_portrait.gif");
    this.sheetSize = [128, 256];
    this.tileSize = [24, 32];
    // Offsets
    this.drawOffset = new Vector(-0.25, 1, 0.125);
    this.hotspotOffset = new Vector(0.5, 0.5, 0);
    // Frames & Faces
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
    // Should the camera follow the avatar?
    this.bindCamera = false;
    // enable speech
    this.enableSpeech = true;
    // Interaction Management
    this.state = "intro";
  }
}
