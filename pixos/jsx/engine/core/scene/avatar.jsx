/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2023 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import { Vector, set } from '@Engine/utils/math/vector.jsx';
import { Direction } from '@Engine/utils/enums.jsx';
import { ActionLoader } from '@Engine/utils/loaders/index.jsx';
import { EventLoader } from '@Engine/utils/loaders/index.jsx';
import Sprite from '@Engine/core/scene/sprite.jsx';

export default class Avatar extends Sprite {
  /**
   * Special class of Sprite which is controlled by the player
   * @param {*} engine
   */
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.handleWalk = this.handleWalk.bind(this);
    this.isLit = true;
    this.isSelected = true;
  }

  /**
   * Initialization Hook
   */
  init() {
    console.log({ msg: '- avatar hook', id: this.id, pos: this.pos, avatar: this });
  }

  /**
   * Tick - Logical Step / Update
   * @param {number} time
   */
  tick(time) {
    // ONLY ONE MOVE AT A TIME
    if (!this.actionList.length) {
      let ret = this.checkInput();
      if (ret) {
        this.addAction(ret).then(() => {});
      }
    }
    if (this.bindCamera) set(this.pos, this.engine.renderManager.camera.cameraPosition);
  }
  /**
   * open menu
   * @param {*} menuConfig
   * @param {*} defaultMenus
   * @returns
   */
  openMenu(menuConfig = {}, defaultMenus = []) {
    return new ActionLoader(this.engine, 'prompt', [menuConfig, defaultMenus, false, { autoclose: false }], this);
  }

  /**
   * Reads for Input to Respond to
   * @returns
   */
  checkInput() {
    // Action Keys
    let key = this.engine.keyboard.lastPressedCode();
    let touchmap = this.engine.gamepad.checkInput();
    let from = this.engine.renderManager.camera.cameraVector;
    let to = this.engine.renderManager.camera.cameraVector;
    // Keyboard
    switch (key) {
      // Bind Camera
      case 'b':
        this.bindCamera = true;
        break;
      // Fixed Camera
      case 'c':
        this.bindCamera = false;
        break;
      // adjust Camera
      case 'x':
        from = this.engine.renderManager.camera.cameraVector;
        console.log(this.engine.renderManager.camera);
        to = this.engine.renderManager.camera.cameraVector.add(new Vector(...[0, 0, 1]));
        to.z = to.z % 9 ?? 8; // locked to every 45 degrees
        if (to.z === 0 && from.z === 8) {
          from.z = 0;
        }
        if (to.z === 0 && from.z === 7) {
          to.z = 8;
        }
        this.zone.world.addEvent(
          new EventLoader(this.engine, 'camera', ['pan', { from, to, duration: 1 }], this.zone.world, () => {
            // let ret = this.faceDir(Direction.rotate(this.facing), true);
            // this.addAction(ret);
          })
        );
        break;
      // adjust Camera
      case 'z':
        from = this.engine.renderManager.camera.cameraVector;
        to = this.engine.renderManager.camera.cameraVector.sub(new Vector(...[0, 0, 1]));
        to.z = to.z % 9; // lock to every 45 degrees
        if (to.z === 0 && from.z === 8) {
          from.z = 0;
        }
        if (to.z === 0 && from.z === 7) {
          to.z = 8;
        }
        this.zone.world.addEvent(
          new EventLoader(this.engine, 'camera', ['pan', { from, to, duration: 1 }], this.zone.world, () => {
            // let ret = this.faceDir(Direction.rotate(this.facing), true);
            // this.addAction(ret);
          })
        );
        break;
      // show menu
      case 'm':
        return this.openMenu(
          {
            main: {
              text: 'Close Menu',
              x: 100,
              y: 100,
              w: 150,
              h: 75,
              colours: {
                top: '#333',
                bottom: '#777',
                background: '#999',
              },
              trigger: (menu) => {
                menu.completed = true;
              },
            },
          },
          ['main']
        );
        break;
      // Interact with tile
      case 'k':
      case 'Enter':
        return new ActionLoader(this.engine, 'interact', [this.pos.toArray(), this.facing, this.zone.world], this);
      // Help Dialogue
      case 'h':
        return new ActionLoader(this.engine, 'dialogue', ['Welcome! You pressed help! Press Escape to close', false, { autoclose: true }], this);
      // Chat Message
      case ' ':
        return new ActionLoader(this.engine, 'chat', ['>:', true, { autoclose: false }], this);
      // Clear Speech
      case 'Escape':
        this.speech.clearHud();
        break;
    }
    // Gamepad controls - TODO
    if (this.engine.gamepad.keyPressed('a')) {
      // select
      return new ActionLoader(this.engine, 'interact', [this.pos.toArray(), this.facing, this.zone.world], this);
    }
    // camera
    if (touchmap['x'] === 1) {
      this.bindCamera = !this.bindCamera;
    }
    // menu
    if (touchmap['y'] === 1) {
      return this.openMenu(
        {
          main: {
            text: 'Close Menu',
            x: 100,
            y: 100,
            w: 150,
            h: 75,
            colours: {
              top: '#333',
              bottom: '#777',
              background: '#999',
            },
            trigger: (menu) => {
              menu.completed = true;
            },
          },
        },
        ['main']
      );
    }

    // Walk
    return this.handleWalk(this.engine.keyboard.lastPressedKey(), touchmap);
  }

  /**
   * Handle the walking keys (wasd + extras (optonal))
   * @param {*} key
   * @param {*} touchmap
   * @returns
   */
  handleWalk(key, touchmap) {
    let moveTime = 600; // move time in ms
    let facing = Direction.None;
    // Read Key presses
    switch (key) {
      // Movement
      case 'w':
        facing = Direction.Up;
        break;
      case 'y':
        this.pos.z++;
        break;
      case 'f':
        this.pos.z--;
        break;
      case 's':
        facing = Direction.Down;
        break;
      case 'a':
        facing = Direction.Left;
        break;
      case 'd':
        facing = Direction.Right;
        break;
      // Patrol
      case 'u':
        return new ActionLoader(this.engine, 'dance', [300, this.zone], this);
      // Patrol
      case 'p':
        return new ActionLoader(this.engine, 'patrol', [this.pos.toArray(), new Vector(8, 13, this.pos.z).toArray(), 600, this.zone], this);
      // Run
      case 'r':
        return new ActionLoader(this.engine, 'patrol', [this.pos.toArray(), new Vector(8, 13, this.pos.z).toArray(), 200, this.zone], this);
      case 't':
        this.engine.renderManager.startTransition({ duration: 2 });
        return;
    }

    // Mobile Gamepad
    // X axis - joystick
    if (touchmap['x-dir'] === 1) {
      // right
      facing = Direction.Right;
    }
    if (touchmap['x-dir'] === -1) {
      // left
      facing = Direction.Left;
    }
    // Y axis - joystick
    if (touchmap['y-dir'] === 1) {
      // down
      facing = Direction.Down;
    }
    if (touchmap['y-dir'] === -1) {
      // up
      facing = Direction.Up;
    }

    // Running?
    if (this.engine.keyboard.shift || this.engine.gamepad.keyPressed('y')) {
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
      return new ActionLoader(this.engine, 'changezone', [this.zone.id, this.pos.toArray(), z.id, to.toArray(), moveTime], this);
    }
    // Check Walking
    if (!this.zone.isWalkable(to.x, to.y, Direction.reverse(facing))) {
      return this.faceDir(facing);
    }
    return new ActionLoader(this.engine, 'move', [this.pos.toArray(), to.toArray(), moveTime, this.zone], this);
  }
}
