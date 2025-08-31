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

import Utils from '../utils/index.jsx';
import { GamePad } from '../utils/gamepad/index.jsx';
import Keyboard from '../utils/keyboard.jsx';
import Database from './database.jsx';
import Store from './store.jsx';
import Hud from './hud/index.jsx';
import RenderManager from './render/manager.jsx';
import ResourceManager from './resource/manager.jsx';
import CutsceneManager from './cutscene/manager.jsx'
import { attachFlagDebugInfo, attachWebglDebugInfo, updateDebugInformation } from './debug/index.jsx';

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

    // CUTSCENE MANAGER
    // Manages scripted cutscene sequences (transitions, waits, zone loads).
    this.cutsceneManager = new CutsceneManager(this);

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

    // Create and configure a debug overlay. This overlay displays
    // performance information such as FPS and draw counts and is toggled
    // using the F3 key and flag information on the F4 key. It is appended to the document body once the
    // engine has been initialized and the DOM is available. The overlay
    // remains hidden until toggled.
    attachWebglDebugInfo(this);
    attachFlagDebugInfo(this);
  }

  /**
   * Render Frame -- TODO -- Add support for multiple game 'modes' - these will be customizable and
   * will allow for overriding the default behaviour.
   * - Such as battle mode, explore mode, FPS, Debug, etc.
   * - Games will be able to handle the core render loop via lua allowing for greater flexibility
   * - Additionally, there will be an overhaul made to the way that keybindings and click-handlers are 
   * - managed which should allow for greater control schemes to be developed via the packages.
   * - One thing to note - will need to have good event-flow control. Need to support passing back and forth
   * - between modes - such as getting into a battle in 'explore' and then shifting into 'fight' mode
   * - which could load up a battle arena, random encounters, and when done, return to the 'explore' mode
   */
  render() {
    this.frameCount++;
    // Reset debug counters at the start of each frame so that metrics
    // reflect only the current frame's draw calls. (stuff like this can be moved to a 'debug mode')
    if (this.renderManager && this.renderManager.resetDebugCounters) {
      this.renderManager.resetDebugCounters();
    }

    // clear canvases
    this.hud.clearHud();
    this.renderManager.clearScreen();

    const timestamp = new Date().getTime();

    // TODO - this will be "mode" dependent - and some modes will have the picker, but it too will need some
    // updates - it will need to support more than just specific types, and may require additionally support
    // for further specification (such as in a battle - only allowing selection of enemies to attack)
    // enable picker shader (Todo - Improve performance - make it only 1x1 pixel framebuffer - and avoid needing to reclear screen)
    this.renderManager.activatePickerShaderProgram(false);
    this.spritz.render(this, timestamp);
    this.getSelectedObject();

    // core render loop (actually render scene to screen)
    this.renderManager.clearScreen();
    this.renderManager.activateShaderProgram();
    this.spritz.update(timestamp); // update scene
    this.spritz.render(this); // render scene
    this.renderManager.updateTransition(); // update transitions
    this.cutsceneManager.update(); // update cutscene (if appl.)
    this.gamepad.render(); // may be optimizable?

    // Update debug overlay if enabled
    updateDebugInformation(this);

    // TODO -- when there is a game mode override - this will instead call the provided
    // game mode.
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
   * todo - need to move into own class
   */
  getSelectedObject(type = 'sprite|object|tile', useFrustum = false) {
    if (this.spritz.world?.spriteList?.length <= 0) {
      return;
    }
    const gl = this.gl;
    const data = new Uint8Array(4);
    const mouseX = this.gamepad.x || 0;
    const mouseY = this.gamepad.y || 0;
    const pixelX = useFrustum ? 0 : (mouseX * gl.canvas.width) / gl.canvas.clientWidth;
    const pixelY = useFrustum ? 0 : gl.canvas.height - (mouseY * gl.canvas.height) / gl.canvas.clientHeight - 1;

    gl.readPixels(
      pixelX, // x
      pixelY, // y
      1, // width
      1, // height
      gl.RGBA, // format
      gl.UNSIGNED_BYTE, // type
      data
    ); // typed array to hold result

    let id = data[0] + (data[1] << 8) + (data[2] << 16); //+ (data[3] << 24);

    // select type(s) based on request
    type.split('|').forEach((t) => {
      switch (t) {
        case 'sprite':
          if (this.gamepad.touches['desktop'].leftClick) {
            // todo - add a new trigger method onSelect()
            // set each sprite selected
            this.spritz.world.spriteList = this.spritz.world.spriteList.map((sprite) => {
              if (sprite.objId === id) {
                sprite.isSelected = true;
                this.spritz.world.spriteDict[sprite.id].isSelected = true;
                this.spritz.world.spriteDict[sprite.id].onSelect(sprite.zone, sprite);
                // this.spritz.world.spriteDict[sprite.id].interact(this.spritz.world.spriteDict['avatar'], () => console.log('selection'));
              }
              return sprite;
            });
          }
          break;
        case 'object':
          if (this.gamepad.touches['desktop'].leftClick) {
            // todo - add a new trigger method onSelect()
            // set each object selected
            this.spritz.world.objectList = this.spritz.world.objectList.map((obj) => {
              if (obj.objId === id) {
                obj.isSelected = true;
                this.spritz.world.objectDict[obj.id].isSelected = true;
                // this.spritz.world.objectDict[sprite.id].interact(this.spritz.world.spriteDict['avatar'], () => console.log('selection'));
              }
              return obj;
            });
          }
          break;
        case 'tile':
          if (this.gamepad.touches['desktop'].leftClick) {
            // read in zone, tile, and cell data from pixel
            let zoneObjId = data[0];
            let row = data[1];
            let cell = data[2];

            // search zones and file selected tile
            this.spritz.world.zoneList.forEach((zone) => {
              if (zone.objId === zoneObjId) {
                zone.onSelect(row, cell);
              }
            });

            console.log('TODO - TILE SELECTION');
            console.log({ zoneObjId, row, cell, zones: this.spritz.world.zoneList });
          }
          break;
      }
    });

    return id;
  }

  /**
   * Greeting Text
   * todo -- need to move somewhere (sprite??)
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
   * @deprecated - Need to rework / Revisit / Remove
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
   * @deprecated - Need to rework / Revisit / Remove
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
   * @deprecated - Need to rework / Revisit / Remove
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
