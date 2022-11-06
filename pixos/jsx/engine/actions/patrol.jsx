/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2022 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import { Vector } from '@Engine/utils/math/vector.jsx';
import { Direction } from '@Engine/utils/enums.jsx';
import { ActionLoader } from '@Engine/utils/loaders/index.jsx';

export default {
  init: function (from, to, moveLength, zone) {
    this.zone = zone;
    this.from = new Vector(...from);
    this.to = new Vector(...to);
    this.lastKey = new Date().getTime();
    this.completed = false;
    this.direction = 1;
    this.audio = this.zone.engine.audioLoader.load('/pixos/audio/sewer-beat.mp3');
    // Determine Path to Walk
    [this.hasMoves, this.moveList] = this.sprite.zone.world.pathFind(from, to);
    if (!this.hasMoves) {
      this.completed = true; // no path - do not patrol
    }
    this.moveIndex = 1; // holds index position
    this.moveLength = moveLength; // length of time per move
    // if (this.zone.audio) this.zone.audio.pauseAudio();
    // this.audio.playAudio();
  },
  tick: function (time) {
    if (!this.loaded) return;
    this.checkInput(time);
    // load up moves - todo (improve this and make it less manual)
    let endTime = this.startTime + this.moveLength;
    if (time > endTime) {
      let move = this.moveList[this.moveIndex];
      if (this.moveList.length > 2) {
        // last position (for facing)
        let last =
          this.moveIndex == 0
            ? this.moveList[this.moveIndex + 1]
            : this.moveIndex + 1 >= this.moveList.length
            ? this.moveList[this.moveList.length - 1]
            : this.moveList[this.moveIndex - 1];
        let facing = Direction.fromOffset([Math.round(move[0] - last[0]), Math.round(move[1] - last[1])]);
        // Check for zone change
        if (!this.sprite.zone.isInZone(move[0], move[1])) {
          let zone = this.sprite.zone.world.zoneContaining(move[0], move[1]);
          if (!zone || !zone.loaded || !zone.isWalkable(move[0], move[1], Direction.reverse(facing))) {
            this.currentAction = this.sprite.faceDir(facing);
          } else {
            this.currentAction = new ActionLoader(
              this.sprite.engine,
              'changezone',
              [this.sprite.zone.id, this.sprite.pos.toArray(), zone.id, move, this.moveLength],
              this.sprite
            );
          }
        } else {
          // Load Next move
          this.currentAction = new ActionLoader(this.sprite.engine, 'move', [last, move, this.moveLength, this.zone], this.sprite);
        }
        // set facing
        if (this.currentAction) {
          this.currentAction.facing = facing;
          this.sprite.addAction(this.currentAction);
        }
      }
      // stop when done
      if (this.moveIndex + this.direction >= this.moveList.length) {
        this.direction *= -1;
        this.completed = true;
        if (this.zone.audio) {
          this.zone.audio.playAudio();
          this.audio.pauseAudio();
        }
      }
      this.moveIndex += this.direction;
      this.startTime = time;
    }
    return this.completed; // loop
  },
  // Handle Keyboard
  checkInput: function (time) {
    if (time > this.lastKey + this.moveLength) {
      switch (this.sprite.engine.keyboard.lastPressed('q')) {
        // close dialogue on q key press
        case 'q':
          if (this.audio) {
            this.audio.pauseAudio();
          }
          this.completed = true; // toggle
        default:
          this.lastKey = new Date().getTime();
          return null;
      }
    }
  },
};
