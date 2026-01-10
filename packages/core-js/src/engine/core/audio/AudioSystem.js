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
 * AudioSystem - Advanced audio management with mixing, effects, and spatial audio.
 * Provides professional-quality audio experience for games.
 */

/**
 * @typedef {object} AudioChannel
 * @property {string} name - Channel name
 * @property {GainNode} gainNode - Volume control node
 * @property {number} volume - Current volume (0-1)
 * @property {boolean} muted - Whether channel is muted
 */

/**
 * @typedef {object} SpatialAudioConfig
 * @property {number} maxDistance - Maximum audible distance
 * @property {number} refDistance - Reference distance for attenuation
 * @property {number} rolloffFactor - How quickly sound attenuates
 * @property {string} distanceModel - 'linear', 'inverse', or 'exponential'
 */

export default class AudioSystem {
  /**
   * Creates an instance of AudioSystem.
   * @param {import('../index.js').default} engine - The game engine instance.
   */
  constructor(engine) {
    /** @type {import('../index.js').default} */
    this.engine = engine;

    /** @type {AudioContext|null} */
    this.context = null;

    /** @type {GainNode|null} */
    this.masterGain = null;

    /** @type {Map<string, AudioChannel>} */
    this.channels = new Map();

    /** @type {Map<string, AudioBuffer>} */
    this.bufferCache = new Map();

    /** @type {Map<string, AudioBufferSourceNode>} */
    this.activeSources = new Map();

    /** @type {DynamicsCompressorNode|null} */
    this.compressor = null;

    /** @type {ConvolverNode|null} */
    this.reverb = null;

    /** @type {GainNode|null} */
    this.reverbGain = null;

    /** @type {boolean} */
    this.initialized = false;

    /** @type {SpatialAudioConfig} */
    this.spatialConfig = {
      maxDistance: 100,
      refDistance: 1,
      rolloffFactor: 1,
      distanceModel: 'inverse',
    };

    /** @type {{ x: number, y: number, z: number }} */
    this.listenerPosition = { x: 0, y: 0, z: 0 };

    // Crossfade state
    /** @type {Map<string, { source: AudioBufferSourceNode, gain: GainNode }>} */
    this.musicTracks = new Map();
  }

  /**
   * Initializes the audio system. Must be called after user interaction.
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) return;

    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();

      // Create master gain
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 1.0;

      // Create compressor to prevent clipping
      this.compressor = this.context.createDynamicsCompressor();
      this.compressor.threshold.value = -24;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 12;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      // Create reverb (dry by default)
      this.reverbGain = this.context.createGain();
      this.reverbGain.gain.value = 0; // Reverb off by default

      // Connect: master -> compressor -> destination
      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.context.destination);

      // Create default channels
      this.createChannel('master', 1.0);
      this.createChannel('music', 0.7);
      this.createChannel('sfx', 1.0);
      this.createChannel('dialogue', 1.0);
      this.createChannel('ambient', 0.5);

      this.initialized = true;
    } catch (e) {
      console.error('Failed to initialize AudioSystem:', e);
    }
  }

  /**
   * Creates an audio channel for mixing.
   * @param {string} name - Channel name
   * @param {number} [volume=1.0] - Initial volume
   * @returns {AudioChannel}
   */
  createChannel(name, volume = 1.0) {
    if (!this.context) return null;

    const gainNode = this.context.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(this.masterGain);

    const channel = {
      name,
      gainNode,
      volume,
      muted: false,
    };

    this.channels.set(name, channel);
    return channel;
  }

  /**
   * Sets volume for a channel.
   * @param {string} channelName - Channel name
   * @param {number} volume - Volume (0-1)
   * @param {number} [fadeTime=0] - Fade time in seconds
   */
  setChannelVolume(channelName, volume, fadeTime = 0) {
    const channel = this.channels.get(channelName);
    if (!channel) return;

    const clampedVolume = Math.max(0, Math.min(1, volume));
    channel.volume = clampedVolume;

    if (fadeTime > 0 && this.context) {
      channel.gainNode.gain.linearRampToValueAtTime(
        channel.muted ? 0 : clampedVolume,
        this.context.currentTime + fadeTime
      );
    } else {
      channel.gainNode.gain.value = channel.muted ? 0 : clampedVolume;
    }
  }

  /**
   * Mutes or unmutes a channel.
   * @param {string} channelName - Channel name
   * @param {boolean} muted - Whether to mute
   */
  setChannelMuted(channelName, muted) {
    const channel = this.channels.get(channelName);
    if (!channel) return;

    channel.muted = muted;
    channel.gainNode.gain.value = muted ? 0 : channel.volume;
  }

  /**
   * Sets master volume.
   * @param {number} volume - Volume (0-1)
   */
  setMasterVolume(volume) {
    if (!this.masterGain) return;
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * Loads an audio buffer from URL.
   * @param {string} url - Audio file URL
   * @returns {Promise<AudioBuffer>}
   */
  async loadBuffer(url) {
    if (this.bufferCache.has(url)) {
      return this.bufferCache.get(url);
    }

    if (!this.context) await this.init();

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

    this.bufferCache.set(url, audioBuffer);
    return audioBuffer;
  }

  /**
   * Plays a sound effect.
   * @param {string|AudioBuffer} sound - URL or AudioBuffer
   * @param {object} [options] - Playback options
   * @param {string} [options.channel='sfx'] - Channel to play on
   * @param {number} [options.volume=1] - Volume multiplier
   * @param {number} [options.pitch=1] - Playback rate
   * @param {boolean} [options.loop=false] - Whether to loop
   * @param {number[]} [options.position] - 3D position [x, y, z] for spatial audio
   * @returns {Promise<string>} Source ID for stopping
   */
  async play(sound, options = {}) {
    if (!this.context) await this.init();

    const {
      channel = 'sfx',
      volume = 1,
      pitch = 1,
      loop = false,
      position = null,
    } = options;

    const buffer = typeof sound === 'string' ? await this.loadBuffer(sound) : sound;
    const channelObj = this.channels.get(channel);
    if (!channelObj) return null;

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    source.playbackRate.value = pitch;

    // Create gain for this sound
    const gainNode = this.context.createGain();
    gainNode.gain.value = volume;

    // Connect with optional spatial audio
    if (position) {
      const panner = this.context.createPanner();
      this.configurePanner(panner, position);
      source.connect(gainNode);
      gainNode.connect(panner);
      panner.connect(channelObj.gainNode);
    } else {
      source.connect(gainNode);
      gainNode.connect(channelObj.gainNode);
    }

    // Generate unique ID
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.activeSources.set(id, source);

    source.onended = () => {
      this.activeSources.delete(id);
    };

    source.start();
    return id;
  }

  /**
   * Stops a playing sound.
   * @param {string} id - Source ID from play()
   */
  stop(id) {
    const source = this.activeSources.get(id);
    if (source) {
      source.stop();
      this.activeSources.delete(id);
    }
  }

  /**
   * Stops all sounds on a channel.
   * @param {string} channelName - Channel name
   */
  stopChannel(channelName) {
    // Note: This stops ALL sounds since we'd need to track by channel
    // A more complete implementation would track sources per channel
    this.activeSources.forEach((source, id) => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.activeSources.clear();
  }

  /**
   * Plays music with optional crossfade from current track.
   * @param {string|AudioBuffer} music - URL or AudioBuffer
   * @param {object} [options] - Playback options
   * @param {number} [options.fadeIn=2] - Fade in duration in seconds
   * @param {number} [options.fadeOut=2] - Fade out duration for current track
   * @param {boolean} [options.loop=true] - Whether to loop
   * @returns {Promise<void>}
   */
  async playMusic(music, options = {}) {
    if (!this.context) await this.init();

    const { fadeIn = 2, fadeOut = 2, loop = true } = options;

    const buffer = typeof music === 'string' ? await this.loadBuffer(music) : music;
    const channel = this.channels.get('music');
    if (!channel) return;

    // Fade out current music
    if (this.musicTracks.size > 0) {
      for (const [id, track] of this.musicTracks) {
        track.gain.gain.linearRampToValueAtTime(0, this.context.currentTime + fadeOut);
        setTimeout(() => {
          try {
            track.source.stop();
          } catch (e) {}
          this.musicTracks.delete(id);
        }, fadeOut * 1000);
      }
    }

    // Create new music source
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;

    const gainNode = this.context.createGain();
    gainNode.gain.value = 0;

    source.connect(gainNode);
    gainNode.connect(channel.gainNode);

    const id = `music_${Date.now()}`;
    this.musicTracks.set(id, { source, gain: gainNode });

    source.start();

    // Fade in
    gainNode.gain.linearRampToValueAtTime(1, this.context.currentTime + fadeIn);
  }

  /**
   * Stops all music with fade out.
   * @param {number} [fadeOut=2] - Fade out duration
   */
  stopMusic(fadeOut = 2) {
    if (!this.context) return;

    for (const [id, track] of this.musicTracks) {
      track.gain.gain.linearRampToValueAtTime(0, this.context.currentTime + fadeOut);
      setTimeout(() => {
        try {
          track.source.stop();
        } catch (e) {}
        this.musicTracks.delete(id);
      }, fadeOut * 1000);
    }
  }

  /**
   * Configures a panner node for spatial audio.
   * @param {PannerNode} panner - The panner node
   * @param {number[]} position - [x, y, z] position
   */
  configurePanner(panner, position) {
    panner.panningModel = 'HRTF';
    panner.distanceModel = this.spatialConfig.distanceModel;
    panner.maxDistance = this.spatialConfig.maxDistance;
    panner.refDistance = this.spatialConfig.refDistance;
    panner.rolloffFactor = this.spatialConfig.rolloffFactor;
    panner.setPosition(position[0], position[1], position[2]);
  }

  /**
   * Updates the listener position for spatial audio.
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} z - Z position
   */
  setListenerPosition(x, y, z) {
    if (!this.context) return;

    this.listenerPosition = { x, y, z };
    const listener = this.context.listener;

    if (listener.positionX) {
      // Modern API
      listener.positionX.value = x;
      listener.positionY.value = y;
      listener.positionZ.value = z;
    } else {
      // Legacy API
      listener.setPosition(x, y, z);
    }
  }

  /**
   * Sets the listener orientation.
   * @param {number} fx - Forward X
   * @param {number} fy - Forward Y
   * @param {number} fz - Forward Z
   * @param {number} ux - Up X
   * @param {number} uy - Up Y
   * @param {number} uz - Up Z
   */
  setListenerOrientation(fx, fy, fz, ux = 0, uy = 1, uz = 0) {
    if (!this.context) return;

    const listener = this.context.listener;

    if (listener.forwardX) {
      listener.forwardX.value = fx;
      listener.forwardY.value = fy;
      listener.forwardZ.value = fz;
      listener.upX.value = ux;
      listener.upY.value = uy;
      listener.upZ.value = uz;
    } else {
      listener.setOrientation(fx, fy, fz, ux, uy, uz);
    }
  }

  /**
   * Sets reverb amount (wet/dry mix).
   * @param {number} amount - Reverb amount (0-1)
   */
  setReverbAmount(amount) {
    if (this.reverbGain) {
      this.reverbGain.gain.value = Math.max(0, Math.min(1, amount));
    }
  }

  /**
   * Creates a simple impulse response for reverb.
   * @param {number} [duration=2] - Reverb duration in seconds
   * @param {number} [decay=2] - Decay rate
   * @returns {AudioBuffer}
   */
  createImpulseResponse(duration = 2, decay = 2) {
    if (!this.context) return null;

    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.context.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }

    return impulse;
  }

  /**
   * Enables reverb with custom impulse response.
   * @param {AudioBuffer} [impulse] - Custom impulse response
   */
  enableReverb(impulse = null) {
    if (!this.context) return;

    this.reverb = this.context.createConvolver();
    this.reverb.buffer = impulse || this.createImpulseResponse();

    // Insert reverb into chain
    this.reverbGain.gain.value = 0.3;
    this.masterGain.connect(this.reverbGain);
    this.reverbGain.connect(this.reverb);
    this.reverb.connect(this.compressor);
  }

  /**
   * Disables reverb.
   */
  disableReverb() {
    if (this.reverbGain) {
      this.reverbGain.gain.value = 0;
    }
  }

  /**
   * Gets volume levels for visualization.
   * @returns {{ left: number, right: number }}
   */
  getVolumeLevels() {
    // This would require an AnalyserNode to implement properly
    return { left: 0, right: 0 };
  }

  /**
   * Resumes audio context if suspended.
   * @returns {Promise<void>}
   */
  async resume() {
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  /**
   * Suspends audio context.
   * @returns {Promise<void>}
   */
  async suspend() {
    if (this.context && this.context.state === 'running') {
      await this.context.suspend();
    }
  }

  /**
   * Cleans up all audio resources.
   */
  dispose() {
    this.stopChannel('all');
    this.stopMusic(0);
    this.bufferCache.clear();
    this.channels.clear();

    if (this.context) {
      this.context.close();
      this.context = null;
    }

    this.initialized = false;
  }
}
