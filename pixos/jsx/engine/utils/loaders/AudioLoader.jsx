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
import { RealTimeBPMAnalyzer } from 'realtime-bpm-analyzer';

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
          if (loader.instances[instance]) {
            loader.instances[instance].pauseAudio();
          }
        });
    }
    // once loaded
    instance.loaded = true;
    return instance;
  }

  // Load Audio Track
  async loadFromZip(zip, src, loop = false) {
    if (this.instances[src]) {
      return this.instances[src];
    }
    console.log({ msg: 'let the beat roll in!' });
    let blob = await zip
      .file(`audio/${src}`)
      .async('arrayBuffer')
      .then((audioData) => {
        let buffer = new Uint8Array(audioData);
        return new Blob([buffer.buffer]);
      });
    let url = URL.createObjectURL(blob);
    console.log({ msg: 'loading audio track...', url });

    let instance = new AudioTrack(url, loop);
    this.instances[src] = instance;
    // Stop other loops
    let loader = this;
    if (loop) {
      Object.keys(loader.instances)
        .filter((instance) => src !== instance)
        .forEach(function (instance) {
          if (loader.instances[instance]) {
            loader.instances[instance].pauseAudio();
          }
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
    this.audioContext = new AudioContext();
    this.bpm = 0;
    this.analyser = this.audioContext.createAnalyser();
    this.audioSource = this.audioContext.createMediaElementSource(this.audio);
    this.audioSource.connect(this.analyser);
    // this.audioSource.connect(this.audioContext.destination);
    this.audioNode = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.audioNode.connect(this.audioContext.destination);
    // Connect everythings together
    this.audioSource.connect(this.audioNode);
    this.audioSource.connect(this.audioContext.destination);
    // bpm analyzer
    const onAudioProcess = new RealTimeBPMAnalyzer({
      scriptNode: {
        bufferSize: 4096,
      },
      pushTime: 2000,
      pushCallback: (err, bpm) => {
        this.bpm = bpm;
      },
    });
    this.audioNode.onaudioprocess = (e) => {
      onAudioProcess.analyze(e);
    };

    // loop if set
    if (loop) {
      this.audio.addEventListener(
        'ended',
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
