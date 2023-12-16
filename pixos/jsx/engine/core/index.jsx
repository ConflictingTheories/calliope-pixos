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

// Absolute imports
import { Vector, negate, degToRad } from '../utils/math/vector.jsx';
import { GamePad } from '../utils/gamepad/index.jsx';
import Keyboard from '../utils/keyboard.jsx';

// Relative imports
import Database from './database.jsx';
import Store from './store.jsx';
import Hud from './hud.jsx';
import RenderManager from './render.jsx';
import ResourceManager from './resource.jsx';

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

    this.Vector = Vector;

    // RESOURCES
    this.resourceManager = new ResourceManager(this);
    this.objLoader = this.resourceManager.objLoader;
    this.audioLoader = this.resourceManager.audioLoader;

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
   * Greeting Text
   * @param {string} text
   */
  setGreeting(text) {
    console.log('setting GREETING');
    this.globalStore.greeting = text;
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
