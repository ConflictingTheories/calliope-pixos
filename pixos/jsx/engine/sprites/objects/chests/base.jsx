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
import Sprite from "../../../core/sprite.jsx";
import { ActionLoader } from "../../../utils/loaders.jsx";

export default class Chest extends Sprite {
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
  // Interaction
  interact(sprite, finish) {
    let ret = null;
    // React based on internal state
    switch (this.state) {
      case "closed":
        this.state = "open";
        this.openChest(sprite);
        finish(true);
        break;
      case "open":
        this.state = "open";
        ret = new ActionLoader(
          this.engine,
          "dialogue",
          ["Empty.", false, { autoclose: true, onClose: () => finish(true) }],
          this
        );
        break;
      default:
        break;
    }
    if (ret) this.addAction(ret);
    // If completion handler passed through - call it when done
    if (finish) finish(false);
    return ret;
  }
  // open Chest
  openChest(sprite) {
    this.startTime = Date.now();
    let endTime = Date.now() + 600;
    while (Date.now() < endTime) {
      let frac = (Date.now() - this.startTime) / 600;
      if (Date.now() >= endTime) {
        frac = 1;
      }
      // Get next frame
      let newFrame = Math.floor(frac * 4);
      if (newFrame != this.animFrame) this.setFrame(newFrame);
    }
    // give inventory
    // this.inventory.forEach((x) => sprite.inventory.push(x));
    // this.inventory = [];
  }
}
