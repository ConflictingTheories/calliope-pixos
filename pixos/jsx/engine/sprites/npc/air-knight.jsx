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

import { Vector } from "../../../engine/utils/math/vector.jsx";
import Resources from "../../../engine/utils/resources.jsx";
import { ActionLoader } from "../../../engine/utils/loaders.jsx";
import Sprite from "../../../engine/core/sprite.jsx";

export default class AirKnight extends Sprite {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    // Character art from http://opengameart.org/content/chara-seth-scorpio
    this.src = Resources.artResourceUrl("air-knight.gif");
    this.sheetSize = [128, 256];
    this.tileSize = [24, 32];
    // Offsets
    this.drawOffset = new Vector(-0.25, 1, 0.125);
    this.hotspotOffset = new Vector(0.5, 0.5, 0);
    // Frames & Faces
    this.frames = {
      up: [
        [0, 0],
        [24, 0],
        [48, 0],
        [24, 0],
      ],
      right: [
        [0, 32],
        [24, 32],
        [48, 32],
        [24, 32],
      ],
      down: [
        [0, 64],
        [24, 64],
        [48, 64],
        [24, 64],
      ],
      left: [
        [0, 96],
        [24, 96],
        [48, 96],
        [24, 96],
      ],
    };
    // Should the camera follow the avatar?
    this.bindCamera = false;
    // enable speech
    this.enableSpeech = true;
    // Interaction Management
    this.state = "intro";
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
          ["Buying stuff eh?!", false, { autoclose: true, onClose: () => finish(true) }],
          this
        );
        if (typeof window.ethereum !== 'undefined') {
          console.log('MetaMask is installed!');
        }
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