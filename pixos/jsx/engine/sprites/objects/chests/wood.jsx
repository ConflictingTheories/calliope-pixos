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
import { ActionLoader } from "../../../utils/loaders.jsx";
import Chest from "./base.jsx";

export default class WoodChest extends Chest {
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
        [0, 0],
        [0, 24],
        [0, 48],
        [0, 72],
      ],
      right: [
        [64, 0],
        [64, 24],
        [64, 48],
        [64, 72],
      ],
      up: [
        [0, 96],
        [0, 120],
        [0, 144],
        [0, 168],
      ],
      left: [
        [128, 0],
        [128, 24],
        [128, 48],
        [128, 72],
      ],
    };
    // Should the camera follow the avatar?
    this.bindCamera = false;
    // enable speech
    this.enableSpeech = true;
    // Interaction Management
    this.state = "closed";
    // Inventory
    this.inventory = [];
  }
}
