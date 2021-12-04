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

import { ActionLoader } from "../../../engine/utils/loaders.jsx";
import FireKnight from "../../../engine/sprites/npc/fire-knight.jsx";
export default class MyFireKnight extends FireKnight {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
  }
  // Interaction
  interact(finish) {
    let ret = null;
    // React based on internal state
    switch (this.state) {
      case "intro":
        this.state = "loop";
        ret = new ActionLoader(
          this.engine,
          "dialogue",
          ["Welcome!", false, { autoclose: true, onClose: () => finish(true) }],
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
    console.log(ret);
    if (ret) this.addAction(ret);
    // If completion handler passed through - call it when done
    if (finish) finish(false);
    return ret;
  }
}
