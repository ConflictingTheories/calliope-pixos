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

// Loads Audio
export class AudioLoader {
  constructor(engine) {
    this.engine = engine;
    this.definitions = [];
    this.instances = {};
  }
  // Load Audio Track
  load(src, loop = false) {
    if (this.instances[src]) {
      return this.instances[src];
    }
    let instance = new AudioTrack(src, loop);
    this.instances[src] = instance;
    // Stop other loops
    let loader = this;
    if (loop) {
      Object.keys(loader.instances)
        .filter((instance) => src !== instance)
        .forEach(function (instance) {
          loader.instances[instance].pauseAudio();
        });
    }
    // once loaded
    instance.loaded = true;
    return instance;
  }
}

export class AudioTrack {
  constructor(src, loop = false) {
    this.src = src;
    this.playing = false;
    this.audio = new Audio(src);
    // loop if set
    if (loop) {
      this.audio.addEventListener(
        "ended",
        function () {
          this.currentTime = 0;
          this.play();
        },
        false
      );
    }
    this.audio.load();
  }
  isPlaying() {
    return this.playing;
  }
  playAudio() {
    const audioPromise = this.audio.play();
    this.playing = true;
    if (audioPromise !== undefined) {
      audioPromise
        .then((_) => {
          // autoplay started
        })
        .catch((err) => {
          // catch dom exception
          console.info(err);
        });
    }
  }
  pauseAudio() {
    const audioPromise = this.audio.pause();
    this.playing = false;
    if (audioPromise !== undefined) {
      audioPromise
        .then((_) => {
          // autoplay started
        })
        .catch((err) => {
          // catch dom exception
          console.info(err);
        });
    }
  }
}
