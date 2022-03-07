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

export default class Plant extends Sprite {
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
    this.blocking = false;
    this.fixed = true;
  }
  // // Interaction
  // interact(sprite, finish) {
  //   let ret = null;
  //   this.startTime = Date.now();
  //   // React based on internal state
  //   switch (this.state) {
  //     case "closed":
  //       this.state = "open";
  //       ret = new ActionLoader(
  //         this.engine,
  //         "dialogue",
  //         ["What beautiful flowers.", false, { autoclose: true, onClose: () => finish(true) }],
  //         this
  //       );
  //       break;
  //     case "open":
  //       this.state = "closed";
  //       ret = new ActionLoader(
  //         this.engine,
  //         "dialogue",
  //         ["so peaceful.", false, { autoclose: true, onClose: () => finish(true) }],
  //         this
  //       );
  //       break;
  //     default:
  //       break;
  //   }
  //   if (ret) this.addAction(ret);
  //   // If completion handler passed through - call it when done
  //   if (finish) finish(false);
  //   return ret;
  // }
}
