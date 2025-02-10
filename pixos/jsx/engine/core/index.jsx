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
    this.frameCount = 0;

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
    this.frameCount++;

    // clear canvases
    this.hud.clearHud();

    const timestamp = new Date().getTime();

    // enable picker shader (Todo - Improve performance - make it only 1x1 pixel framebuffer - and avoid needing to reclear screen)
    this.renderManager.clearScreen();
    this.renderManager.activatePickerShaderProgram();
    this.spritz.render(this, timestamp);
    this.getSelectedObject(true);

    // core render loop
    this.renderManager.clearScreen(); // todo - move into view
    this.renderManager.activateShaderProgram();
    this.gamepad.render();
    this.spritz.render(this, timestamp);

    // transitions - todo - not working
    if (this.isTransitioning) {
      this.renderManager.transition();
    }

    this.requestId = requestAnimationFrame(this.render);
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
  getSelectedObject(log = false) {
    if (this.spritz.world?.spriteList?.length <= 0) {
      return;
    }
    const gl = this.gl;
    const data = new Uint8Array(4);
    const mouseX = this.gamepad.x || 0;
    const mouseY = this.gamepad.y || 0;
    const pixelX = (mouseX * gl.canvas.width) / gl.canvas.clientWidth;
    const pixelY = gl.canvas.height - (mouseY * gl.canvas.height) / gl.canvas.clientHeight - 1;

    gl.readPixels(
      pixelX, // x
      pixelY, // y
      1, // width
      1, // height
      gl.RGBA, // format
      gl.UNSIGNED_BYTE, // type
      data
    ); // typed array to hold result

    // id selected
    const id = data[0] + (data[1] << 8) + (data[2] << 16); //+ (data[3] << 24);

    // set each sprite selected
    this.spritz.world.spriteList = this.spritz.world.spriteList.map((sprite) => {
      if (sprite.objId === id) {
        sprite.isSelected = true;
        this.spritz.world.spriteDict[sprite.id].isSelected = true;
      }
      return sprite;
    });

    // set each object selected
    this.spritz.world.objectList = this.spritz.world.objectList.map((obj) => {
      if (obj.objId === id) {
        obj.isSelected = true;
        this.spritz.world.objectDict[obj.id].isSelected = true;
      }
      return obj;
    });

    return id;
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
