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
import AnimatedSprite from "../effects/base/animatedSprite.jsx";
import { ActionLoader } from "../../utils/loaders.jsx";

export default class Portal extends AnimatedSprite {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.src = Resources.artResourceUrl("room.png");
    this.sheetSize = [256, 256];
    this.tileSize = [16, 32];
    // this.fixed = true;
    // Frames
    this.frames = {
      up: [
        [0, 210],
        [18, 210],
        [36, 210],
        [54, 210],
      ],
      left: [
        [0, 210],
        [18, 210],
        [36, 210],
        [54, 210],
      ],
      right: [
        [0, 210],
        [18, 210],
        [36, 210],
        [54, 210],
      ],
      down: [
        [0, 210],
        [18, 210],
        [36, 210],
        [54, 210],
      ],
    };
    this.drawOffset = new Vector(0, 1.001, 0.001);
    this.hotspotOffset = new Vector(0.5, 0.5, 0);
    this.frameTime = 150;
    this.state = "closed";
  }
  // Initialize
  init() {
    this.triggerTime = 1000;
  }
  // Interact
  interact(sprite, finish) {
    let ret = null;
    this.startTime = Date.now();
    // React based on internal state
    switch (this.state) {
      case "closed":
        this.state = "open";
        this.blocking = false;
        this.override = true;
        this.frames = {
          up: [
            [96, 210],
            [114, 210],
            [132, 210],
            [150, 210],
          ],
          right: [
            [96, 210],
            [114, 210],
            [132, 210],
            [150, 210],
          ],
          left: [
            [96, 210],
            [114, 210],
            [132, 210],
            [150, 210],
          ],
          down: [
            [96, 210],
            [114, 210],
            [132, 210],
            [150, 210],
          ],
        };
        ret = new ActionLoader(
          this.engine,
          "dialogue",
          ["The portal is Open.", false, { autoclose: true, onClose: () => finish(true) }],
          this
        );
        break;
      case "open":
        this.state = "closed";
        this.blocking = true;
        this.override = false;
        ret = new ActionLoader(
          this.engine,
          "dialogue",
          ["The portal is Closed.", false, { autoclose: true, onClose: () => finish(true) }],
          this
        );
        this.frames = {
          up: [
            [0, 210],
            [18, 210],
            [36, 210],
            [54, 210],
          ],
          left: [
            [0, 210],
            [18, 210],
            [36, 210],
            [54, 210],
          ],
          right: [
            [0, 210],
            [18, 210],
            [36, 210],
            [54, 210],
          ],
          down: [
            [0, 210],
            [18, 210],
            [36, 210],
            [54, 210],
          ],
        };
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
