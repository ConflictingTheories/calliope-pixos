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

import createTransition from 'gl-transition';

// Absolute imports
import { Vector, negate, degToRad } from '../utils/math/vector.jsx';
import { AudioLoader } from '../utils/loaders/AudioLoader.jsx';
import { GamePad } from '../utils/gamepad/index.jsx';
import { OBJ } from '../utils/obj';
import Keyboard from '../utils/keyboard.jsx';

// Relative imports
import { Texture, ColorTexture } from './texture.jsx';
import Speech from './speech.jsx';
import Database from './database.jsx';
import Store from './store.jsx';
import Hud from './hud.jsx';
import RenderManager from './render.jsx';

export default class GLEngine {
  /**
   * Core Pixos Graphics & Game Engine
   * @param {*} canvas
   * @param {*} hudcanvas
   * @param {*} mipmap
   * @param {*} gamepadcanvas
   * @param {*} fileUpload
   * @param {*} width
   * @param {*} height
   */
  constructor(canvas, hudcanvas, mipmap, gamepadcanvas, fileUpload, width, height) {
    // CANVASES
    this.canvas = canvas;
    this.hudcanvas = hudcanvas;
    this.gamepadcanvas = gamepadcanvas;
    this.mipmap = mipmap;

    // INPUTS
    this.fileUpload = fileUpload;

    // SCREEN
    this.width = width;
    this.height = height;

    // ASSETS
    this.objLoader = OBJ;
    this.textures = [];
    this.speeches = [];

    this.Vector = Vector;
    this.globalStore = {};

    // RENDERING (Graphics, Lights, Camera)
    this.renderManager = new RenderManager(this);
    this.lightManager = this.renderManager.lightManager;
    this.camera = this.renderManager.camera;

    //HUD
    this.hud = new Hud(this);

    // KEYBOARD
    this.keyboard = new Keyboard(this);

    // GAMEPAD
    this.gamepad = new GamePad(this);

    // AUDIO & VOICE
    this.voice = new SpeechSynthesisUtterance();
    this.audioLoader = new AudioLoader(this);

    // DATABASE
    this.database = new Database();

    // MEMORY STORE
    this.store = new Store();

    // bind
    this.screenSize = this.screenSize.bind(this);
    this.render = this.render.bind(this);
    this.init = this.init.bind(this);
    this.close = this.close.bind(this);
  }

  /**
   * Initialize a Spritz object
   * @param {*} spritz
   */
  async init(spritz) {
    const ctx = this.hudcanvas.getContext('2d');
    const gl = this.canvas.getContext('webgl2');
    const gp = this.gamepadcanvas.getContext('2d');

    if (!gl) {
      throw new Error('WebGL : unable to initialize');
    }
    if (!ctx) {
      throw new Error('Canvas : unable to initialize HUD');
    }
    if (!gp) {
      throw new Error('Gamepad : unable to initialize Mobile Canvas');
    }

    // make HUD same size as canvas
    ctx.canvas.width = gl.canvas.clientWidth;
    ctx.canvas.height = gl.canvas.clientHeight;

    this.gl = gl;
    this.ctx = ctx;
    this.gp = gp;

    this.spritz = spritz;
    this.fullscreen = false;

    // initial time
    this.time = new Date().getTime();

    // init keyboard
    this.keyboard.init();
    
    // initialize hud
    this.hud.init(ctx);

    // initialize render manager
    this.renderManager.init(gl);

    // Configure Gamepad & touch
    this.gamepad.init(gp);
    this.touch = this.gamepad.listen.bind(this.gamepad);

    // Initialize Spritz
    await spritz.init(this);
  }

  /**
   * Render Frame
   */
  render() {
    this.requestId = requestAnimationFrame(this.render);

    // clear canvases
    this.hud.clearHud();
    this.renderManager.clearScreen(); // todo - move into view

    // default shader program
    this.renderManager.activateShaderProgram();

    // core render loop
    // this.lightManager.render();
    this.gamepad.render();
    this.spritz.render(this, new Date().getTime());

    // transitions - todo - not working
    if (this.isTransitioning) {
      this.renderManager.transition();
    }
  }

  /**
   * Clear Render Loop
   */
  close() {
    cancelAnimationFrame(this.requestId);
  }

  /**
   * Text to Speech output
   * @param {string} text
   * @param {SpeechSynthesisVoice} voice
   * @param {string} lang
   * @param {number} rate
   * @param {number} volume
   * @param {number} pitch
   */
  speechSynthesis(text, voice = null, lang = 'en', rate = null, volume = null, pitch = null) {
    let speech = this.voice;
    let voices = window.speechSynthesis.getVoices() ?? [];
    // set voice
    speech.voice = voices[0];
    if (rate) speech.rate = rate;
    if (volume) speech.volume = volume;
    if (pitch) speech.pitch = pitch;
    speech.text = text;
    speech.lang = lang;
    // speak
    window.speechSynthesis.speak(speech);
  }

  /**
   * Greeting Text
   * @param {string} text
   */
  setGreeting(text) {
    console.log('setting GREETING');
    this.globalStore.greeting = text;
  }

  /**
   * convert a stream to a video
   * @param {*} stream
   * @param {*} ref
   * @returns
   */
  streamToVideo(stream, ref) {
    let video = document.createElement('video');
    if (ref) {
      video = ref.current;
    }
    video.srcObject = stream;
    video.style.width = stream.width;
    video.style.height = stream.height;
    video.play();
    return video;
  }

  /**
   * convert a stream to an image
   * @param {*} stream
   * @param {*} ref
   * @returns
   */
  streamToImage(stream, ref) {
    let video = document.createElement('video');
    if (ref) {
      video = ref.current;
    }
    video.srcObject = stream;
    video.style.width = stream.width;
    video.style.height = stream.height;
    video.play();
    return video;
  }

  /**
   * convert a stream to a texture
   * @param {*} stream
   * @param {*} ref
   * @returns
   */
  streamToTexture(stream, ref) {
    let video = document.createElement('video');
    if (ref) {
      video = ref.current;
    }
    video.srcObject = stream;
    video.style.width = stream.width;
    video.style.height = stream.height;
    video.play();
    return video;
  }

  /**
   * load texture
   * @param {*} src
   * @returns
   */
  loadTexture(src) {
    if (this.textures[src]) return this.textures[src];
    this.textures[src] = new Texture(src, this);
    return this.textures[src];
  }

  /**
   * load texture from zip
   * @param {*} src
   * @param {*} zip
   * @returns
   */
  async loadTextureFromZip(src, zip) {
    if (this.textures[src]) return this.textures[src];
    let imageData = await zip.file(`textures/${src}`).async('arrayBuffer');
    let buffer = new Uint8Array(imageData);
    let blob = new Blob([buffer.buffer]);
    let dataUrl = URL.createObjectURL(blob);
    this.textures[src] = new Texture(dataUrl, this);
    return this.textures[src];
  }

  /**
   * load speech
   * @param {*} src
   * @param {*} canvas
   * @returns
   */
  loadSpeech(src, canvas) {
    if (this.speeches[src]) return this.speeches[src];
    this.speeches[src] = new Speech(canvas, this, src);
    return this.speeches[src];
  }

  /**
   * Screensize
   * @returns
   */
  screenSize() {
    return {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight,
    };
  }
}
