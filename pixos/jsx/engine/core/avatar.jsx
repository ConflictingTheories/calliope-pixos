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

import { Vector, set } from "../utils/math/vector.jsx";
import { Direction } from "../utils/enums.jsx";
import { ActionLoader } from "../utils/loaders.jsx";
import Sprite from "./sprite.jsx";

// Special class of Sprite which is controlled by the player
//
// -- Additional methods such as saving / importing and input handling
//
export default class Avatar extends Sprite {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.handleWalk = this.handleWalk.bind(this);
  }
  // Initialization Hook
  init() {
    console.log("- avatar hook", this.id, this.pos);
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
    let touchmap = this.engine.gamepad.checkInput();
    // Keyboard
    switch (key) {
      // Bind Camera
      case "b":
        this.bindCamera = true;
        break;
      // Fixed Camera
      case "c":
        this.bindCamera = false;
        break;
      // show menu
      case "m":
        return new ActionLoader(
          this.engine,
          "menu",
          [
            [
              {
                text: "Click Me",
                active: true,
                x: 100,
                y: 100,
                w: 150,
                h: 75,
                colours: {
                  top: "#333",
                  bottom: "#777",
                  background: "#999",
                },
                children: [
                  {
                    text: "Click Me Again",
                    x: 110,
                    y: 110,
                    w: 150,
                    h: 75,
                    colours: { top: "#333", bottom: "#777", background: "#999" },
                    children: [
                      {
                        text: "Click Me ONE MORE",
                        x: 110,
                        y: 110,
                        w: 150,
                        h: 75,
                        colours: { top: "#333", bottom: "#777", background: "#999" },
                        trigger: () => {
                          this.zone.world.loadZone("room");
                        },
                      },
                    ],
                  },
                ],
              },
            ],
            false,
            { autoclose: false },
          ],
          this
        );
        break;
      case "z":
        // this.zone.world.removeZone("room");
        this.zone.world.removeZone("room");
        this.zone.world.loadZone("dungeon-top");
        this.zone.world.loadZone("dungeon-bottom");
        break;
      case "y":
        this.zone.world.removeZone("dungeon-top");
        this.zone.world.removeZone("dungeon-bottom");
        this.zone.world.loadZone("room");
        break;
      // Interact with tile
      case "k":
      case "Enter":
        return new ActionLoader(this.engine, "interact", [this.pos.toArray(), this.facing, this.zone.world], this);
      // Help Dialogue
      case "h":
        return new ActionLoader(
          this.engine,
          "dialogue",
          ["Welcome! You pressed help! Press Escape to close", false, { autoclose: true }],
          this
        );
      // Chat Message
      case " ":
        return new ActionLoader(this.engine, "chat", [">:", true, { autoclose: false }], this);
      // Clear Speech
      case "q":
      case "Escape":
        this.speech.clearHud();
        break;
    }
    // Gamepad controls - TODO
    if (this.engine.gamepad.keyPressed("a")) {
      // select
      return new ActionLoader(this.engine, "interact", [this.pos.toArray(), this.facing, this.zone.world], this);
    }
    if (touchmap["x"] === 1) {
      // camera
      this.bindCamera = !this.bindCamera;
    }
    // Walk
    return this.handleWalk(this.engine.keyboard.lastPressedKey(), touchmap);
  }
  // walk between tiles
  handleWalk(key, touchmap) {
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
      case "u":
        return new ActionLoader(this.engine, "dance", [300, this.zone], this);
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
    }

    // Mobile Gamepad
    // X axis - joystick
    if (touchmap["x-dir"] === 1) {
      // right
      facing = Direction.Right;
    }
    if (touchmap["x-dir"] === -1) {
      // left
      facing = Direction.Left;
    }
    // Y axis - joystick
    if (touchmap["y-dir"] === 1) {
      // down
      facing = Direction.Down;
    }
    if (touchmap["y-dir"] === -1) {
      // up
      facing = Direction.Up;
    }

    // Running?
    if (this.engine.keyboard.shift || this.engine.gamepad.keyPressed("y")) {
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
    return new ActionLoader(this.engine, "move", [this.pos.toArray(), to.toArray(), moveTime, this.zone], this);
  }
}
