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
import Sprite from "@Engine/core/sprite.jsx";
import { ActionLoader } from "@Engine/utils/loaders/index.jsx";

export default class Chest extends Sprite {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    // Should the camera follow the avatar?
    this.bindCamera = false;
    // enable speech
    this.enableSpeech = true;
    // Interaction Management
    this.state = "closed";
    // Inventory
    this.inventory = [];
    this.fixed = true;
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
              if(sprite.inventory){
                sprite.inventory.push(...this.inventory);
              }
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
}
