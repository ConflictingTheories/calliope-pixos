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

import { Vector, set } from "../../../engine/utils/math/vector";
import { Direction } from "../../../engine/utils/enums";
import { ActionLoader } from "../../../engine/utils/loaders";
import Resources from "../../../engine/utils/resources";
export default {
  // Character art from http://opengameart.org/content/chara-seth-scorpio
  src: Resources.artResourceUrl("player.gif"),
  sheetSize: [128, 256],
  tileSize: [24, 32],
  // Frames & Faces
  frames: {
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
  },
  // Offsets
  drawOffset: new Vector(-0.25, 1, 0.125),
  hotspotOffset: new Vector(0.5, 0.5, 0),
  // Should the camera follow the player?
  bindCamera: true,
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
    if (this.bindCamera) set(this.pos, this.engine.cameraPosition);
  },
  // Reads for Input to Respond to
  checkInput: function () {
    let moveTime = 600; // move time in ms
    let facing = Direction.None;
    // Read Key presses
    switch (this.engine.keyboard.lastPressedKey("wsadhm")) {
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
      // Help Dialogue
      case "h":
        return new ActionLoader(
          this.engine,
          "dialogue",
          ["Welcome! You pressed help!", false, { autoclose: true }],
          this
        );
        // Chat Message
        case "m":
          return new ActionLoader(
            this.engine,
            "chat",
            [">:", true, { autoclose: false }],
            this
          );
      default:
        return null;
    }
    // Check Direction
    if (this.facing !== facing) {
      return this.faceDir(facing);
    }
    // Determine Location
    let from = this.pos;
    let dp = Direction.toOffset(facing);
    let to = new Vector(...[Math.round(from.x + dp[0]), Math.round(from.y + dp[1]), 0]);
    // Check zones if changing
    if (!this.zone.isInZone(to.x, to.y)) {
      let z = this.zone.world.zoneContaining(to.x, to.y);
      if (!z || !z.loaded || !z.isWalkable(to.x, to.y, Direction.reverse(facing))) {
        return this.faceDir(facing);
      }
      return new ActionLoader(
        this.engine,
        "changezone",
        [this.zone.id, this.pos.toArray(), z.id, to.toArray(), moveTime],
        this
      );
    }
    // Check Walking
    if (
      !this.zone.isWalkable(this.pos.x, this.pos.y, facing) ||
      !this.zone.isWalkable(to.x, to.y, Direction.reverse(facing))
    ) {
      return this.faceDir(facing);
    }
    return new ActionLoader(this.engine, "move", [this.pos.toArray(), to.toArray(), moveTime], this);
  },
  // Set Facing
  faceDir: function (facing) {
    if (this.facing == facing || facing === Direction.None) return null;
    return new ActionLoader(this.engine, "face", [facing], this);
  },
  // set message (for chat bubbles)
  setGreeting: function(greeting){
    return new ActionLoader(
      this.engine,
      "greeting",
      [greeting, { autoclose: true }],
      this
    );
  }
};
