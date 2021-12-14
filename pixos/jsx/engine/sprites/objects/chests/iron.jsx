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
import { Vector } from "../../../utils/math/vector.jsx";
import Resources from "../../../utils/resources.jsx";
import Chest from "./base.jsx";
export default class IronChest extends Chest {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    // Character art from http://opengameart.org/content/chara-seth-scorpio
    this.src = Resources.artResourceUrl("chests.gif");
    this.sheetSize = [256, 256];
    this.tileSize = [16, 24];
    // Offsets
    this.drawOffset = new Vector(0, 1, 0.2);
    this.hotspotOffset = new Vector(0.5, 0.5, 0);
    // Frames & Faces
    this.frames = {
      down: [
        [16, 0],
        [16, 24],
        [16, 48],
        [16, 72],
      ],
      right: [
        [80, 0],
        [80, 24],
        [80, 48],
        [80, 72],
      ],
      up: [
        [16, 96],
        [16, 120],
        [16, 144],
        [16, 168],
      ],
      left: [
        [144, 0],
        [144, 24],
        [144, 48],
        [144, 72],
      ],
    };
    // Should the camera follow the avatar?
    this.bindCamera = false;
    // enable speech
    this.enableSpeech = true;
    // Interaction Management
    this.state = "closed";
    this.inventory = [];
  }
}
