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

import { Vector, set } from "./utils/math/vector.jsx";
import { Direction } from "./utils/enums.jsx";
import { ActionLoader } from "./utils/loaders.jsx";
import Sprite from "./sprite.jsx";

export default class Avatar extends Sprite {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    // Frames
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
    this.enableSpeech = true;
    this.isWalkable = false;
    // Offsets
    this.drawOffset = new Vector(-0.25, 1, 0.125);
    this.hotspotOffset = new Vector(0.5, 0.5, 0);
    // Should the camera follow the avatar?
    this.bindCamera = false;
    this.handleWalk = this.handleWalk.bind(this);
  }
  // Update
  tick(time) {
    // ONLY ONE MOVE AT A TIME
    if (!this.actionList.length) {
      let ret = this.checkInput();
      if (ret) {
        this.addAction(ret);
      }
    }
    if (this.bindCamera) set(this.pos, this.engine.cameraPosition);
  }
  // Reads for Input to Respond to
  checkInput() {
    // Action Keys
    let key = this.engine.keyboard.lastPressedCode();
    // Misc Actions
    switch (key) {
      // Bind Camera
      case "b":
        this.bindCamera = true;
        break;
      // Fixed Camera
      case "c":
        this.bindCamera = false;
        break;
      // play scene
      case "y":
        this.zone.playScene('strange-legend'); // trigger a scene to start
        break;
      // Interact with tile
      case "k":
      case "Enter":
        return new ActionLoader(this.engine, "interact", [this.pos.toArray(), this.facing, this.zone.world], this);
      // Help Dialogue
      case "h":
        return new ActionLoader(this.engine, "dialogue", ["Welcome! You pressed help!", false, { autoclose: true }], this);
      // Chat Message
      case "m":
      case " ":
        return new ActionLoader(this.engine, "chat", [">:", true, { autoclose: false }], this);
      // Clear Speech
      case "q":
      case "Escape":
        this.speech.clearHud();
        break;
    }
    // Walk
    return this.handleWalk(this.engine.keyboard.lastPressedKey());
  }
  // walk between tiles
  handleWalk(key) {
    let moveTime = 600; // move time in ms
    let facing = Direction.None;
    // Read Key presses
    switch (key) {
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
      // Patrol
      case "p":
        return new ActionLoader(
          this.engine,
          "patrol",
          [this.pos.toArray(), new Vector(8, 13, this.pos.z).toArray(), 600, this.zone],
          this
        );
      // Run
      case "r":
        return new ActionLoader(
          this.engine,
          "patrol",
          [this.pos.toArray(), new Vector(8, 13, this.pos.z).toArray(), 200, this.zone],
          this
        );
      default:
        return null;
    }
    // Running?
    if (this.engine.keyboard.shift) {
      moveTime = 200;
    } else {
      moveTime = 600;
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
      return new ActionLoader(this.engine, "changezone", [this.zone.id, this.pos.toArray(), z.id, to.toArray(), moveTime], this);
    }
    // Check Walking
    if (!this.zone.isWalkable(to.x, to.y, Direction.reverse(facing))) {
      return this.faceDir(facing);
    }
    return new ActionLoader(this.engine, "move", [this.pos.toArray(), to.toArray(), moveTime], this);
  }
}
