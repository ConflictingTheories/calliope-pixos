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

import { Vector } from "../../utils/math/vector.jsx";
import Resources from "../../utils/resources.jsx";
import Sprite from "../../core/sprite.jsx";
import { ActionLoader } from "../../utils/loaders.jsx";

export default class Door extends Sprite {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.src = Resources.artResourceUrl("room.gif");
    this.sheetSize = [256, 256];
    this.tileSize = [16, 32];
    // Frames
    this.frames = {
      up: [
        [48, 64],
        [48, 96]
      ],
      right: [
        [48, 64],
        [48, 96]
      ],
      left: [
        [48, 64],
        [48, 96]
      ],
      down: [
        [48, 64],
        [48, 96]
      ],
    };
    this.state = "closed";
    this.drawOffset = new Vector(0, 1.001, 0.001);
    this.hotspotOffset = new Vector(0.5, 0.5, 0);
  }

  // Interaction
  interact(sprite, finish) {
    let ret = null;
    this.startTime = Date.now();
    // React based on internal state
    switch (this.state) {
      case "closed":
        this.state = "open";
        ret = new ActionLoader(
          this.engine,
          "animate",
          [
            600,
            3,
            () => {
              console.log("OPENED!!!")
              finish(true);
            },
          ],
          this
        );
        break;
      case "open":
        this.state = "open";
        ret = new ActionLoader(
          this.engine,
          "dialogue",
          ["Its already Open!.", false, { autoclose: true, onClose: () => finish(true) }],
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
}