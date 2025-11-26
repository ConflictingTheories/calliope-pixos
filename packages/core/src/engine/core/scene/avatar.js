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

/**
 * @fileoverview Avatar class for Pixos game engine.
 * Represents the player-controlled character.
 */

import { Vector, set } from '@Engine/utils/math/vector.js';
import { Direction } from '@Engine/utils/enums.js';
import { ActionLoader } from '@Engine/utils/loaders/index.js';
import { EventLoader } from '@Engine/utils/loaders/index.js';
import Sprite from '@Engine/core/scene/sprite.js';

/**
 * @typedef {object} AvatarData
 * @property {number} id - The avatar's object ID.
 * @property {boolean} templateLoaded - Whether the template is loaded.
 * @property {Vector} drawOffset - The draw offset.
 * @property {Vector} hotspotOffset - The hotspot offset.
 * @property {number} animFrame - The animation frame.
 * @property {boolean} fixed - Whether the avatar is fixed.
 * @property {Vector} pos - The position.
 * @property {Vector} scale - The scale.
 * @property {string} facing - The facing direction.
 * @property {object} actionDict - The action dictionary.
 * @property {Array} actionList - The action list.
 * @property {string} gender - The gender.
 * @property {object} speech - The speech object.
 * @property {string} portrait - The portrait.
 * @property {Array} inventory - The inventory.
 * @property {boolean} blocking - Whether blocking.
 * @property {boolean} override - Whether overriding.
 * @property {boolean} isLit - Whether lit.
 * @property {number} lightIndex - The light index.
 * @property {Array<number>} lightColor - The light color.
 * @property {number} density - The density.
 * @property {boolean} isSelected - Whether selected.
 */

/**
 * Avatar - Represents the player-controlled character in the game.
 */
export default class Avatar extends Sprite {
  /**
   * Creates an instance of Avatar.
   * @param {import('../index.js').default} engine - The game engine instance.
   */
  constructor(engine) {
    super(engine);
    /** @type {boolean} */
    this.isLit = true;
    /** @type {boolean} */
    this.isSelected = true;
  }

  /**
   * Gets the avatar data for serialization or debugging.
   * @returns {AvatarData} The avatar data object.
   */
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
    };
  }

  /**
   * Initialization hook for the avatar.
   */
  init = () => {
    console.log({ msg: '- avatar hook', id: this.id, pos: this.pos, avatar: this });
  };

  /**
   * Updates the avatar each frame.
   * @param {number} time - The current time.
   */
  tick = (time) => {
    if (!this.actionList.length) {
      let ret = this.checkInput();
      if (ret) {
        this.addAction(ret).then(() => {
          if (this.engine.networkManager && this.engine.networkManager.ws && this.engine.networkManager.ws.readyState === WebSocket.OPEN) {
            this.engine.networkManager.sendAction(ret, this);
          }
        });
      }
    }

    if (this.engine.networkManager && this.engine.networkManager.ws && this.engine.networkManager.ws.readyState === WebSocket.OPEN) {
      this.engine.networkManager.updateAvatarPosition(this);
    }

    if (this.bindCamera) set(this.pos, this.engine.renderManager.camera.cameraPosition);
  };

  /**
   * Checks input from the Input Manager.
   * @returns {ActionLoader|null} Action to perform or null.
   */
  checkInput = () => {
    return this.engine.inputManager.getAvatarAction(this);
  };

  /**
   * Opens a menu for the avatar.
   * @param {object} menuConfig - The menu configuration.
   * @param {Array} defaultMenus - The default menus.
   * @returns {ActionLoader} The action loader for the menu.
   */
  openMenu = (menuConfig = {}, defaultMenus = []) => {
    return new ActionLoader(this.engine, 'prompt', [menuConfig, defaultMenus, false, { autoclose: false }], this);
  };

  /**
   * Handles walking input.
   * @param {string} key - The key pressed.
   * @param {object} touchmap - The touch map for mobile input.
   * @param {number} [forceFacing=null] - Optional forced facing direction (overrides key-based direction).
   * @returns {ActionLoader|null} The action loader or null.
   */
  handleWalk = (key, touchmap, forceFacing = null) => {
    let moveTime = 600;
    let facing = forceFacing !== null ? forceFacing : Direction.None;
    
    // Only use key-based direction if no forced facing is provided
    if (forceFacing === null) {
      switch (key) {
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
        case 'u':
          return new ActionLoader(this.engine, 'dance', [300, this.zone], this);
        case 'p':
          return new ActionLoader(this.engine, 'patrol', [this.pos.toArray(), new Vector(8, 13, this.pos.z).toArray(), 600, this.zone], this);
        case 'r':
          return new ActionLoader(this.engine, 'patrol', [this.pos.toArray(), new Vector(8, 13, this.pos.z).toArray(), 200, this.zone], this);
      }
    }

    if (touchmap['x-dir'] === 1) {
      facing = Direction.Right;
    }
    if (touchmap['x-dir'] === -1) {
      facing = Direction.Left;
    }
    if (touchmap['y-dir'] === 1) {
      facing = Direction.Down;
    }
    if (touchmap['y-dir'] === -1) {
      facing = Direction.Up;
    }

    if (this.engine.keyboard.shift || this.engine.gamepad.keyPressed('y')) {
      moveTime = 200;
    } else {
      moveTime = 600;
    }
    if (this.facing !== facing) {
      return this.faceDir(facing);
    }
    let from = this.pos;
    let dp = Direction.toOffset(facing);
    let to = new Vector(...[Math.round(from.x + dp[0]), Math.round(from.y + dp[1]), 0]);
    if (!this.zone.isInZone(to.x, to.y)) {
      let z = this.zone.world.zoneContaining(to.x, to.y);
      if (!z || !z.loaded || !z.isWalkable(to.x, to.y, Direction.reverse(facing))) {
        return this.faceDir(facing);
      }
      return new ActionLoader(this.engine, 'changezone', [this.zone.id, this.pos.toArray(), z.id, to.toArray(), moveTime], this);
    }
    if (!this.zone.isWalkable(to.x, to.y, Direction.reverse(facing))) {
      return this.faceDir(facing);
    }
    return new ActionLoader(this.engine, 'move', [this.pos.toArray(), to.toArray(), moveTime, this.zone], this);
  };
}
