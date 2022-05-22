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

import { ActionLoader } from "@Engine/utils/loaders/index.jsx";
import WaterKnight from "@Engine/sprites/npc/water-knight.jsx";
export default class MyWaterKnight extends WaterKnight {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
  }
  // Interaction
  interact(sprite, finish) {
    let ret = null;
    // React based on internal state
    switch (this.state) {
      case "intro":
        this.state = "loop";
        ret = new ActionLoader(
          this.engine,
          "dialogue",
          [["I am the Water Knight!", "Here is my home.", "yo"], false, { autoclose: false, onClose: () => finish(true) }],
          this
        );
        break;
      case "loop":
        this.state = "loop2";
        ret = new ActionLoader(
          this.engine,
          "dialogue",
          ["I heard about a strange legend once.", false, { autoclose: true, onClose: () => finish(true) }],
          this
        );
        break;
      case "loop2":
        this.state = "loop";
        ret = new ActionLoader(
          this.engine,
          "dialogue",
          ["Sorry, I don't remember the story at the moment", false, { autoclose: true, onClose: () => finish(true) }],
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
