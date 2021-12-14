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
export default class BlueChest extends Chest {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    // Character art from http://opengameart.org/content/chara-seth-scorpio
    this.src = Resources.artResourceUrl("chests.gif");
    this.sheetSize = [256, 256]; // (actually 512 - gives 2x up-res)
    this.tileSize = [16, 24]; // (relative to other sprites)
    // Offsets
    this.drawOffset = new Vector(0, 1, 0.2);
    this.hotspotOffset = new Vector(0.5, 0.5, 0);
    // Frames & Faces
    this.frames = {
      up: [
        [48, 0],
        [48, 24],
        [48, 48],
        [48, 72],
      ],
      left: [
        [112, 0],
        [112, 24],
        [112, 48],
        [112, 72],
      ],
      down: [
        [48, 96],
        [48, 120],
        [48, 144],
        [48, 168],
      ],
      right: [
        [176, 0],
        [176, 24],
        [176, 48],
        [176, 72],
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
