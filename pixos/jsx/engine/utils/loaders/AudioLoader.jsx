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
