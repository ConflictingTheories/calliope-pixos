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
import Sprite from "@Engine/core/sprite.jsx";
import { ActionLoader } from "@Engine/utils/loaders/index.jsx";

export default class Door extends Sprite {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.src = Resources.artResourceUrl("room.gif");
    this.sheetSize = [256, 256];
    this.tileSize = [16, 32];
    this.fixed = true;
    // Frames
    this.frames = {
      up: [
        [48, 64],
        [48, 96],
      ],
      right: [
        [48, 64],
        [48, 96],
      ],
      left: [
        [48, 64],
        [48, 96],
      ],
      down: [
        [48, 64],
        [48, 96],
      ],
    };
    this.drawOffset = new Vector(0, 1.001, 0.001);
    this.hotspotOffset = new Vector(0.5, 0.5, 0);
    this.state = "closed";
  }

  // Interaction
  interact(sprite, finish) {
    let ret = null;
    this.startTime = Date.now();
    // React based on internal state
    switch (this.state) {
      case "closed":
        this.state = "open";
        this.blocking = false;
        this.override = true;
        ret = new ActionLoader(
          this.engine,
          "animate",
          [
            600,
            3,
            () => {
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

  // when stepping on tile position (if not blocking)
  onStep(sprite) {
    let world = this.zone.world;
    world.removeAllZones();
    if (this.zones) this.zones.forEach((z) => world.loadZone(z));
    return null;
  }
}
