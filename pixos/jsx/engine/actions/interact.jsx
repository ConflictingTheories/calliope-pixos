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

import { Vector } from '@Engine/utils/math/vector.jsx';
import { Direction } from '@Engine/utils/enums.jsx';

export default {
  init: async function (from, facing, world) {
    this.world = world;
    this.from = new Vector(...from);
    this.facing = facing;
    this.offset = Direction.toOffset(facing);
    this.lastKey = new Date().getTime();
    this.completed = false;
    // Determine Tile
    this.to = [from[0] + this.offset[0], from[1] + this.offset[1]];
    // Check for Sprites at that point
    this.zone = world.zoneContaining(...this.to);
    // Trigger interaction on Sprite
    this.spriteList = this.zone.spriteList.filter((sprite) => sprite.pos.x === this.to[0] && sprite.pos.y === this.to[1]);
    this.objectList = this.zone.objectList.filter((object) => object.pos.x === this.to[0] && object.pos.y === this.to[1]);
    // -- pass through reference to "finish()" callback
    this.finish = this.finish.bind(this);
    // Trigger
    this.interact();
  },
  // Trigger interactions in sprites
  interact: async function () {
    if (this.spriteList.length === 0 && this.objectList.length === 0) this.completed = true;
    // objects
    await Promise.all(this.objectList.map(async (object) => {
      let faceChange = object.faceDir(Direction.reverse(this.facing));
      if (faceChange) {
        object.addAction(faceChange); // face towards avatar
      }
      return object.interact ? await this.zone.objectDict[object.id].interact(this.sprite, this.finish) : null;
    }));
    // sprite
    await Promise.all(this.spriteList.map(async (sprite) => {
      let faceChange = sprite.faceDir(Direction.reverse(this.facing));
      if (faceChange) {
        sprite.addAction(faceChange); // face towards avatar
      }
      return sprite.interact ? await this.zone.spriteDict[sprite.id].interact(this.sprite, this.finish) : null;
    }));
  },
  // Callback to clear interaction
  finish: function (result) {
    if (result) this.completed = true;
  },
  // check input and completion
  tick: function (time) {
    if (!this.loaded) return;
    this.checkInput(time);
    return this.completed; // loop
  },
  // Handle Keyboard
  checkInput: function (time) {
    if (time > this.lastKey + this.length) {
      switch (this.sprite.engine.keyboard.lastPressed('q')) {
        // close dialogue on q key press
        case 'q':
          // Needs to Cancel the Interaction on the Affected Sprite as well
          this.completed = true; // toggle
          break;
        default:
          this.lastKey = new Date().getTime();
          return null;
      }
    }
    // gamepad
    if (this.sprite.engine.gamepad.keyPressed('a')) {
      this.completed = true;
    }
  },
};
