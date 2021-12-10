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

import { ActionLoader } from "../../../../engine/utils/loaders.jsx";
import IronChest from "../../../../engine/sprites/objects/chests/iron.jsx";

export default class MyMetalChest extends IronChest {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    // todo - plan and implement an inventory system
    this.inventory = [];
  }
  // Interaction handler
  interact(finish) {
    let ret = null;
    // React based on internal state
    switch (this.state) {
      case "closed":
        this.state = "open";
        // open sprite by running animation sequence
        //
        // Check Inventory and provide
        break;
    case "open":
            this.state = "closed";
            // close sprite by running reverse animation sequence
            //
            break;
      default:
        break;
    }
    console.log(ret);
    if (ret) this.addAction(ret);
    // If completion handler passed through - call it when done
    if (finish) finish(false);
    return ret;
  }
}
