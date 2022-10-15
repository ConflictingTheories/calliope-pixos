"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _enums = require("@Engine/utils/enums.jsx");

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
var _default = {
  init: function init(moveLength, zone) {
    this.zone = zone;
    this.moveLength = moveLength;
    this.startTime = new Date().getTime();
    this.lastKey = new Date().getTime();
    this.completed = false;
    this.audio = this.zone.engine.audioLoader.load("/pixos/audio/brass-loop.mp3"); // if (this.zone.audio) this.zone.audio.pauseAudio();

    this.audio.playAudio();
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.audioSource = this.audioContext.createMediaElementSource(this.audio.audio);
    this.audioSource.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  },
  tick: function tick(time) {
    if (!this.loaded) return; // listen to audio freq data

    var fbc_array = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(fbc_array);
    this.checkInput(time); // load up moves - todo (improve this and make it less manual)

    var endTime = this.startTime + this.moveLength;

    if (time > endTime) {
      // set facing based on audio
      var facing = this.sprite.facing == _enums.Direction.Right ? _enums.Direction.Left : _enums.Direction.Right;
      var bar_pos,
          bar_width,
          bar_height = null;

      for (var i = 0; i < 16; i++) {
        bar_pos = i * 4;
        bar_width = 2;
        bar_height = -(fbc_array[i] / 2);
      }

      if (bar_height > 80) {
        facing = this.sprite.facing == _enums.Direction.Right ? _enums.Direction.Down : _enums.Direction.Left;
      } else {
        facing = this.sprite.facing == _enums.Direction.Up ? _enums.Direction.Left : _enums.Direction.Down;
      }

      this.sprite.addAction(this.sprite.faceDir(facing));
      this.startTime = time;
    } // next move


    return this.completed; // loop
  },
  // Handle Keyboard
  checkInput: function checkInput(time) {
    if (time > this.lastKey + this.moveLength) {
      switch (this.sprite.engine.keyboard.lastPressed("q")) {
        // close dialogue on q key press
        case "q":
          this.audio.pauseAudio();
          this.completed = true;
        // toggle

        default:
          this.lastKey = new Date().getTime();
          return null;
      }
    }
  }
};
exports["default"] = _default;