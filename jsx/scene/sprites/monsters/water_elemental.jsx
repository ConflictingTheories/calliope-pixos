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
export default {
  // Character art from http://opengameart.org/content/twelve-16x18-rpg-character-sprites-including-npcs-and-elementals
  src: Resources.artResourceUrl("elementals.gif"),
  sheetSize: [64, 128],
  tileSize: [16, 18],
  // Frame Positions
  frames: {
    up: [
      [0, 54],
      [16, 54],
      [32, 54],
      [48, 54],
    ],
    right: [
      [0, 72],
      [16, 72],
      [32, 72],
      [16, 72],
    ],
    down: [
      [0, 90],
      [16, 90],
      [32, 90],
      [16, 90],
    ],
    left: [
      [48, 54],
      [48, 72],
      [48, 90],
      [48, 72],
    ],
  },
  // Offsets
  drawOffset: new Vector(0, 1, 0.2),
  hotspotOffset: new Vector(0.5, 0.5, 0),
  // Update
  tick: function (time) {
    if (!this.actionList.length) {
      let ret = this.checkInput();
      if (ret) {
        // Send action to the server
        // network.sendAction(ret);

        // Start running action locally to avoid latency
        // Local action will be replaced with a server-sanitised
        // version on the next update
        this.addAction(ret);
      }
    }
  },
  // Reads for Input to Respond to for player
  checkInput: function () {
    let facing = Direction.None;
    // Read Key presses
    switch (this.engine.keyboard.lastPressedKey("wsad")) {
      // Movement
      case "w":
        facing = Direction.Up;
        break;
      case "s":
        facing = Direction.Down;
        break;
      case "a":
        facing = Direction.Left;
        break;
      case "d":
        facing = Direction.Right;
        break;
      default:
        return null;
    }
    // Check Direction
    if (this.facing !== facing) {
      return this.faceDir(facing);
    }
  },
  // Set Facing
  faceDir: function (facing) {
    if (this.facing == facing || facing === Direction.None) return null;
    return new ActionLoader(this, "face", [facing]);
  },
};
