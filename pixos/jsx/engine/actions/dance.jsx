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

import { Direction } from '@Engine/utils/enums.jsx';

export default {
  init: function (moveLength, zone) {
    this.zone = zone;
    this.moveLength = moveLength;
    this.startTime = new Date().getTime();
    this.lastKey = new Date().getTime();
    this.completed = false;
    this.audio = this.zone.engine.audioLoader.load('/pixos/audio/sewer-beat.mp3', true);
    // if (this.zone.audio) this.zone.audio.pauseAudio();

    // analyze the audio context
    this.audio.playAudio();
  },
  tick: function (time) {
    if (!this.loaded) return;
    // listen to audio freq data
    let fbc_array = new Uint8Array(this.audio.analyser.frequencyBinCount);
    this.audio.analyser.getByteFrequencyData(fbc_array);

    // load up moves - todo (improve this and make it less manual)
    this.checkInput(time);
    let endTime = this.startTime + this.moveLength;
    if (time > endTime) {
      //   // set facing based on audio
      let facing = this.sprite.facing == Direction.Right ? Direction.Left : Direction.Right;
      let bar_pos,
        bar_width,
        bar_height = null;

      for (var i = 0; i < 16; i++) {
        bar_pos = i * 4;
        bar_width = 2;
        bar_height = -(fbc_array[i] / 2);
      }
      if (bar_height > 80) {
        facing = this.sprite.facing == Direction.Right ? Direction.Down : Direction.Left;
      } else {
        facing = this.sprite.facing == Direction.Up ? Direction.Left : Direction.Down;
      }
      this.sprite.addAction(this.sprite.faceDir(facing)).then(()=>{});
      this.startTime = time;
    }

    // change on the beat (NEEDS WORK)
    // let facing = this.sprite.facing;
    // let beat = this.audio.bpm ? time % ((this.audio.bpm[0].tempo ?? 1) * 1000) : 1;
    // while (beat === 0) {
    //   switch (this.sprite.facing) {
    //     case Direction.Up:
    //       facing = Direction.Left;
    //       break;
    //     case Direction.Down:
    //       facing = Direction.Right;
    //       break;
    //     case Direction.Right:
    //       facing = Direction.Up;
    //       break;
    //     case Direction.Left:
    //       facing = Direction.Down;
    //       break;
    //     default:
    //       facing = Direction.Down;
    //       break;
    //   }
    // }
    // this.sprite.addAction(this.sprite.faceDir(facing));
    // this.startTime = time;
    // }

    // next move
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
