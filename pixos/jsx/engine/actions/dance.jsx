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

import { Vector } from "@Engine/utils/math/vector.jsx";
import { Direction } from "@Engine/utils/enums.jsx";
import { AudioLoader } from "@Engine/utils/loaders/index.jsx";

export default {
  init: function (moveLength, zone) {
    this.zone = zone;
    this.moveLength = moveLength;
    this.startTime = new Date().getTime();
    this.lastKey = new Date().getTime();
    this.completed = false;
    this.audio = new AudioLoader("/pixos/audio/brass-loop.mp3");
    if (this.zone.audio) this.zone.audio.pauseAudio();
    this.audio.playAudio();
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.audioSource = this.audioContext.createMediaElementSource(this.audio.audio);
    this.audioSource.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  },
  tick: function (time) {
    if (!this.loaded) return;
    // listen to audio freq data
    let fbc_array = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(fbc_array);
    this.checkInput(time);
    // load up moves - todo (improve this and make it less manual)
    let endTime = this.startTime + this.moveLength;
    if (time > endTime) {
      // set facing based on audio
      let facing = this.sprite.facing == Direction.Right ? Direction.Left : Direction.Right;
      let bar_pos,bar_width,bar_height = null;

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
      this.sprite.addAction(this.sprite.faceDir(facing));
      this.startTime = time;
    }
    // next move
    return this.completed; // loop
  },

  // Handle Keyboard
  checkInput: function (time) {
    if (time > this.lastKey + this.moveLength) {
      switch (this.sprite.engine.keyboard.lastPressed("q")) {
        // close dialogue on q key press
        case "q":
          this.audio.pauseAudio();
          this.completed = true; // toggle
        default:
          this.lastKey = new Date().getTime();
          return null;
      }
    }
  },
};
