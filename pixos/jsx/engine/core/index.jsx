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

import Utils from '../utils/index.jsx';
import { GamePad } from '../utils/gamepad/index.jsx';
import Keyboard from '../utils/keyboard.jsx';
import Database from './database.jsx';
import Store from './store.jsx';
import Hud from './hud.jsx';
import RenderManager from './render/manager.jsx';
import ResourceManager from './resource/manager.jsx';

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

    // UTILITIES
    this.utils = Utils;

    // RESOURCES
    this.resourceManager = new ResourceManager(this);

    // RENDERING (Graphics, Lights, Camera)
    this.renderManager = new RenderManager(this);

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
    this.hud.init();

    // initialize render manager
    this.renderManager.init();

    // Configure Gamepad & touch
    this.gamepad.init();
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

    const timestamp = new Date().getTime();

    // enable picker shader
    this.renderManager.activatePickerShaderProgram();
    this.spritz.render(this, timestamp);

    const selectedObj = this.getSelectedObject();
    
    // default shader program
    this.renderManager.activateShaderProgram();

    // core render loop
    this.gamepad.render();
    this.spritz.render(this, timestamp);

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
   * Get Selected Object on screen
   */
  getSelectedObject() {
    const gl = this.gl;
    const data = new Uint8Array(4);
    
    gl.readPixels(
        0,                 // x
        0,                 // y
        1,                 // width
        1,                 // height
        gl.RGBA,           // format
        gl.UNSIGNED_BYTE,  // type
        data);             // typed array to hold result
    
    const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);

    // console.log('Selected Object ID:', data, id);

    // restore the object's color
    // if (oldPickNdx >= 0) {
      // const object = objects[oldPickNdx];
      // object.uniforms.u_colorMult = oldPickColor;
      // oldPickNdx = -1;
    // }

    // highlight object under mouse
    // if (id > 0) {
      // const pickNdx = id - 1;
      // oldPickNdx = pickNdx;
      // const object = objects[pickNdx];
      // oldPickColor = object.uniforms.u_colorMult;
      // object.uniforms.u_colorMult = (frameCount & 0x8) ? [1, 0, 0, 1] : [1, 1, 0, 1];
    // }
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
