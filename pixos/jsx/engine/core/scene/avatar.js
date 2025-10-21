/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import { Vector, set } from '@Engine/utils/math/vector.js';
import { Direction } from '@Engine/utils/enums.js';
import { ActionLoader } from '@Engine/utils/loaders/index.js';
import { EventLoader } from '@Engine/utils/loaders/index.js';
import Sprite from '@Engine/core/scene/sprite.js';

export default class Avatar extends Sprite {
  /**
   * Special class of Sprite which is controlled by the player
   * @param {*} engine
   */
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    // todo - revisit this - for now this is more useful for debugging
    this.isLit = true;
    this.isSelected = true;
  }

  getAvatarData = () => {
    return {
      id: this.objId,
      templateLoaded: this.templateLoaded,
      drawOffset: this.drawOffset,
      hotspotOffset: this.hotspotOffset,
      animFrame: this.animFrame,
      fixed: this.fixed,
      pos: this.pos,
      scale: this.scale,
      facing: this.facing,
      actionDict: this.actionDict,
      actionList: this.actionList,
      gender: this.gender,
      speech: this.speech,
      portrait: this.portrait,
      inventory: this.inventory,
      blocking: this.blocking,
      override: this.override,
      isLit: this.isLit,
      lightIndex: this.lightIndex,
      lightColor: this.lightColor,
      density: this.density,
      isSelected: this.isSelected
    }
  }

  /**
   * Initialization Hook
   */
  init = () => {
    console.log({ msg: '- avatar hook', id: this.id, pos: this.pos, avatar: this });
  }

  /**
   * Tick - Logical Step / Update
   * @param {number} time
   */
  tick = (time) => {
    // ONLY ONE MOVE AT A TIME
    if (!this.actionList.length) {
      let ret = this.checkInput();
      if (ret) {
        this.addAction(ret).then(() => {
          // Send action to server if multiplayer is enabled
          if (this.engine.networkManager && this.engine.networkManager.ws && this.engine.networkManager.ws.readyState === WebSocket.OPEN) {
            this.engine.networkManager.sendAction(ret, this);
          }
        });
      }
    }

    // Send position updates to server periodically or on change
    if (this.engine.networkManager && this.engine.networkManager.ws && this.engine.networkManager.ws.readyState === WebSocket.OPEN) {
      this.engine.networkManager.updateAvatarPosition(this);
    }

    if (this.bindCamera) set(this.pos, this.engine.renderManager.camera.cameraPosition);
  }

  /**
   * Check input from the Input Manager instead of hardcoded keys
   * @returns {ActionLoader|null} Action to perform or null
   */
  checkInput = () => {
    // Let Input Manager handle input based on current mode mappings
    return this.engine.inputManager.getAvatarAction(this);
  }
  /**
   * open menu
   * @param {*} menuConfig
   * @param {*} defaultMenus
   * @returns
   */
  openMenu = (menuConfig = {}, defaultMenus = []) => {
    return new ActionLoader(this.engine, 'prompt', [menuConfig, defaultMenus, false, { autoclose: false }], this);
  }

  /**
   * Handle the walking keys (wasd + extras (optonal))
   * @param {*} key
   * @param {*} touchmap
   * @returns
   */
  handleWalk = (key, touchmap) => {
    let moveTime = 600; // move time in ms
    let facing = Direction.None;
    // Read Key presses
    switch (key) {
      // Movement
      case 'w':
        facing = Direction.Up;
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
    }

    // TODO - Needs to move into input handler Mobile Gamepad
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
