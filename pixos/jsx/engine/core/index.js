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

import Utils from '../utils/index.js';
import { GamePad } from '../utils/gamepad/index.js';
import Keyboard from '../utils/keyboard.js';
import Database from './database/index.js';
import Store from './store/index.js';
import Hud from './hud/index.js';
import RenderManager from './render/manager.js';
import ResourceManager from './resource/manager.js';
import CutsceneManager from './cutscene/manager.js';
import ModeManager from './mode/ModeManager.js'; // Import ModeManager
import { attachFlagDebugInfo, attachWebglDebugInfo, updateDebugInformation } from './debug/index.js';

/**
 * @typedef {object} SpritzGame
 * @property {function(GLEngine): Promise<void>} init - Initializes the game.
 * @property {function(GLEngine, number): void} render - Renders the game scene.
 * @property {function(number): void} update - Updates the game state.
 * @property {import('./scene/world.js').World} world - The game world instance.
 * @property {object} shaders - Shader programs for the game.
 * @property {object} effects - Visual effects for the game.
 * @property {boolean} loaded - Indicates if the game resources are loaded.
 */

/**
 * Core Pixos Graphics & Game Engine.
 * This class orchestrates the main game loop, rendering, input handling, and resource management.
 */
export default class GLEngine {
  /**
   * Creates an instance of GLEngine.
   * @param {HTMLCanvasElement} canvas - The main WebGL canvas.
   * @param {HTMLCanvasElement} hudcanvas - The 2D canvas for HUD elements.
   * @param {HTMLCanvasElement} mipmap - The canvas for mipmap generation (or similar utility).
   * @param {HTMLCanvasElement} gamepadcanvas - The 2D canvas for mobile gamepad controls.
   * @param {HTMLInputElement} fileUpload - The file input element for resource loading.
   * @param {number} width - The desired width of the game viewport.
   * @param {number} height - The desired height of the game viewport.
   */
  constructor(canvas, hudcanvas, mipmap, gamepadcanvas, fileUpload, width, height) {
    /** @type {HTMLCanvasElement} */
    this.canvas = canvas;
    /** @type {HTMLCanvasElement} */
    this.hudcanvas = hudcanvas;
    /** @type {HTMLCanvasElement} */
    this.gamepadcanvas = gamepadcanvas;
    /** @type {HTMLCanvasElement} */
    this.mipmap = mipmap;

    /** @type {HTMLInputElement} */
    this.fileUpload = fileUpload;

    /** @type {number} */
    this.width = width;
    /** @type {number} */
    this.height = height;

    /** @type {object} */
    this.utils = Utils;

    /** @type {ResourceManager} */
    this.resourceManager = new ResourceManager(this);

    /** @type {RenderManager} */
    this.renderManager = new RenderManager(this);

    /** @type {Hud} */
    this.hud = new Hud(this);

    /** @type {Keyboard} */
    this.keyboard = new Keyboard(this);

    /** @type {GamePad} */
    this.gamepad = new GamePad(this);

    /** @type {SpeechSynthesisUtterance} */
    this.voice = new SpeechSynthesisUtterance();

    /** @type {Database} */
    this.database = new Database();

    /** @type {Store} */
    this.store = new Store();

    /** @type {CutsceneManager} */
    this.cutsceneManager = new CutsceneManager(this);

    /** @type {ModeManager} */
    this.modeManager = new ModeManager(this); // Initialize ModeManager

    /** @type {WebGL2RenderingContext} */
    this.gl = null;
    /** @type {CanvasRenderingContext2D} */
    this.ctx = null;
    /** @type {CanvasRenderingContext2D} */
    this.gp = null;
    /** @type {number} */
    this.frameCount = 0;
    /** @type {SpritzGame} */
    this.spritz = null;
    /** @type {boolean} */
    this.fullscreen = false;
    /** @type {number} */
    this.time = 0;
    /** @type {number} */
    this.requestId = null; // For requestAnimationFrame

    // Bind methods to the instance
    this.screenSize = this.screenSize.bind(this);
    this.render = this.render.bind(this);
    this.init = this.init.bind(this);
    this.close = this.close.bind(this);
  }

  /**
   * Initializes the game engine and the Spritz game instance.
   * @param {SpritzGame} spritz - The Spritz game object to initialize.
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   * @throws {Error} If WebGL, HUD canvas, or Gamepad canvas cannot be initialized.
   */
  async init(spritz) {
    const ctx = this.hudcanvas.getContext('2d');
    const gl = this.canvas.getContext('webgl2');
    const gp = this.gamepadcanvas.getContext('2d');

    if (!gl) {
      throw new Error('WebGL: unable to initialize');
    }
    if (!ctx) {
      throw new Error('Canvas: unable to initialize HUD');
    }
    if (!gp) {
      throw new Error('Gamepad: unable to initialize Mobile Canvas');
    }

    // Make HUD same size as canvas
    ctx.canvas.width = gl.canvas.clientWidth;
    ctx.canvas.height = gl.canvas.clientHeight;

    this.gl = gl;
    this.ctx = ctx;
    this.gp = gp;
    this.frameCount = 0;

    this.spritz = spritz;
    this.fullscreen = false;

    // Initial time
    this.time = new Date().getTime();

    // Init keyboard
    this.keyboard.init();

    // Initialize HUD
    this.hud.init();

    // Initialize render manager
    this.renderManager.init();

    // Configure Gamepad & touch
    this.gamepad.init();
    this.touch = this.gamepad.listen.bind(this.gamepad);

    // Initialize Spritz game
    await spritz.init(this);

    // Create and configure debug overlays. These overlays display
    // performance information such as FPS and draw counts (toggled by F3)
    // and flag information (toggled by F4). They are appended to the document body
    // once the engine has been initialized and the DOM is available. The overlays
    // remain hidden until toggled.
    attachWebglDebugInfo(this);
    attachFlagDebugInfo(this);
  }

  /**
   * The main render loop for the game engine.
   * This method is called continuously via `requestAnimationFrame` to update and draw the game.
   * It handles debug counters, clears canvases, updates game state, renders the scene,
   * and manages transitions.
   *
   * TODO: Add support for multiple game 'modes' - these will be customizable and
   * will allow for overriding the default behaviour.
   * - Such as battle mode, explore mode, FPS, Debug, etc.
   * - Games will be able to handle the core render loop via Lua allowing for greater flexibility.
   * - Additionally, there will be an overhaul made to the way that keybindings and click-handlers are
   * - managed which should allow for greater control schemes to be developed via the packages.
   * - One thing to note - will need to have good event-flow control. Need to support passing back and forth
   * - between modes - such as getting into a battle in 'explore' and then shifting into 'fight' mode
   * - which could load up a battle arena, random encounters, and when done, return to the 'explore' mode.
   */
  render() {
    this.frameCount++;
    // Reset debug counters at the start of each frame so that metrics
    // reflect only the current frame's draw calls.
    if (this.renderManager && this.renderManager.resetDebugCounters) {
      this.renderManager.resetDebugCounters();
    }

    // Clear canvases
    this.hud.clearHud();
    // Draw active mode label (if any)
    if (this.hud.drawModeLabel) this.hud.drawModeLabel();
    this.renderManager.clearScreen();

    const timestamp = new Date().getTime();

    // Object picking pass (for selection)
    // TODO: This will be "mode" dependent - and some modes will have the picker, but it too will need some
    // updates - it will need to support more than just specific types, and may require additionally support
    // for further specification (such as in a battle - only allowing selection of enemies to attack).
    // Enable picker shader (Todo - Improve performance - make it only 1x1 pixel framebuffer - and avoid needing to reclear screen).
    this.renderManager.activatePickerShaderProgram(false);
    this.spritz.render(this, timestamp); // Render scene for picking pass
    this.getSelectedObject(); // Process object selection

    // Core render loop (actually render scene to screen)
    const gl = this.renderManager.engine.gl;
    this.renderManager.clearScreen();
    // Draw skybox first, with depth writes disabled
    gl.depthMask(false);
    this.renderManager.renderSkybox();
    gl.depthMask(true);
    // Now draw world tiles/objects, then sprites
    this.renderManager.activateShaderProgram();

    // Update and render based on the active game mode
    this.modeManager.update(timestamp); // Update active mode
    this.spritz.update(timestamp); // Update scene (might be overridden by mode)
    this.spritz.render(this); // Render scene (might be overridden by mode)

    this.cutsceneManager.update(); // Update cutscene (if applicable)
    this.renderManager.updateTransition(); // Update transitions
    this.gamepad.render(); // Render gamepad (may be optimizable?)

    // Update debug overlay if enabled
    updateDebugInformation(this);

    this.requestId = requestAnimationFrame(this.render);
  }

  /**
   * Stops the main render loop.
   */
  close() {
    cancelAnimationFrame(this.requestId);
  }

  /**
   * Detects and returns the selected object on screen based on mouse/touch input.
   * This method uses a color-picking technique where objects are rendered with unique
   * IDs to an off-screen buffer, and the pixel under the cursor is read to identify the object.
   * @param {'sprite'|'object'|'tile'|string} [type='sprite|object|tile'] - The type(s) of objects to consider for selection, pipe-separated.
   * @param {boolean} [useFrustum=false] - Whether to use a 1x1 pixel frustum for picking (performance optimization).
   * @returns {number|null} The ID of the selected object, or null if no object is selected or freecam is active.
   *
   * TODO: Refactor this into its own `Picker` class for better organization and testability.
   * TODO: Implement `onSelect()` trigger method for sprites and objects.
   * TODO: Improve tile selection logic and integrate with game modes.
   */
  getSelectedObject(type = 'sprite|object|tile', useFrustum = false) {
    // When FreeCam is active, suppress picking to avoid interfering with camera controls
    if (this._freecamActive) return null;
    if (this.spritz.world?.spriteList?.length <= 0 && this.spritz.world?.objectList?.length <= 0 && this.spritz.world?.zoneList?.length <= 0) {
      return null; // No pickable objects in the scene
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

    let id = data[0] + (data[1] << 8) + (data[2] << 16);

    // Only process selection if a left click occurred
    if (!this.gamepad.touches['desktop'].leftClick) {
      return id;
    }

    // Select type(s) based on request
    type.split('|').forEach((t) => {
      switch (t) {
        case 'sprite':
          this.spritz.world.spriteList = this.spritz.world.spriteList.map((sprite) => {
            if (sprite.objId === id) {
              sprite.isSelected = true;
              if (this.spritz.world.spriteDict[sprite.id]) {
                this.spritz.world.spriteDict[sprite.id].isSelected = true;
                // TODO: Add a new trigger method onSelect()
                if (typeof this.spritz.world.spriteDict[sprite.id].onSelect === 'function') {
                  this.spritz.world.spriteDict[sprite.id].onSelect(sprite.zone, sprite);
                }
              }
            } else {
              sprite.isSelected = false; // Deselect others
            }
            return sprite;
          });
          break;
        case 'object':
          this.spritz.world.objectList = this.spritz.world.objectList.map((obj) => {
            if (obj.objId === id) {
              obj.isSelected = true;
              if (this.spritz.world.objectDict[obj.id]) {
                this.spritz.world.objectDict[obj.id].isSelected = true;
                // TODO: Add a new trigger method onSelect()
                if (typeof this.spritz.world.objectDict[obj.id].onSelect === 'function') {
                  this.spritz.world.objectDict[obj.id].onSelect(obj.zone, obj);
                }
              }
            } else {
              obj.isSelected = false; // Deselect others
            }
            return obj;
          });
          break;
        case 'tile':
          // Read in zone, tile, and cell data from pixel
          let zoneObjId = data[0];
          let row = data[1];
          let cell = data[2];

          // Search zones and find selected tile
          this.spritz.world.zoneList.forEach((zone) => {
            if (zone.objId === zoneObjId) {
              if (typeof zone.onSelect === 'function') {
                zone.onSelect(row, cell);
              }
            }
          });
          if (id !== 0) { // If a valid ID was picked (not background)
            console.log('TILE SELECTION:', { zoneObjId, row, cell, zones: this.spritz.world.zoneList });
          }
          break;
      }
    });

    return id;
  }

  /**
   * Sets a greeting text.
   * @deprecated This method should be moved to a more appropriate class, e.g., `Hud` or a new `DialogueManager`.
   * @param {string} text - The greeting text to set.
   */
  setGreeting(text) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Setting GREETING:', text);
    }
    // Assuming globalStore exists and is the correct place for this
    if (this.globalStore) {
      this.globalStore.greeting = text;
    } else {
      console.warn('globalStore is not available to set greeting.');
    }
  }

  /**
   * Converts text to speech using the Web Speech API.
   * @param {string} text - The text to speak.
   * @param {SpeechSynthesisVoice} [voice=null] - The voice to use. Defaults to the first available voice.
   * @param {string} [lang='en'] - The language of the speech.
   * @param {number} [rate=null] - The speed of the speech (0.1 to 10).
   * @param {number} [volume=null] - The volume of the speech (0 to 1).
   * @param {number} [pitch=null] - The pitch of the speech (0 to 2).
   */
  speechSynthesis(text, voice = null, lang = 'en', rate = null, volume = null, pitch = null) {
    let speech = this.voice;
    let voices = window.speechSynthesis.getVoices() ?? [];
    // Set voice
    speech.voice = voice || voices[0];
    if (rate) speech.rate = rate;
    if (volume) speech.volume = volume;
    if (pitch) speech.pitch = pitch;
    speech.text = text;
    speech.lang = lang;
    // Speak
    window.speechSynthesis.speak(speech);
  }


  /**
   * Returns the current client width and height of the main canvas.
   * @returns {{width: number, height: number}} An object containing the width and height.
   */
  screenSize() {
    return {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight,
    };
  }
}
