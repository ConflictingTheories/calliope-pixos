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
import Database from './database/index.js';
import Store from './store/index.js';
import Hud from './hud/index.js';
import RenderManager from './render/manager.js';
import ResourceManager from './resource/manager.js';
import CutsceneManager from './cutscene/manager.js';
import ModeManager from './mode/manager.js'; // Import ModeManager
import InputManager from './input/manager.js'; // Import InputManager
import NetworkManager from './net/manager.js';
import { attachFlagDebugInfo, attachWebglDebugInfo, updateDebugInformation } from './debug/index.js';

/**
 * @typedef {object} SpritzGame
 * @property {function(GLEngine): Promise<void>} init - Initializes the game.
 * @property {function(GLEngine, number): void} render - Renders the game scene.
 * @property {function(number): void} update - Updates the game state.
 * @property {import('./scene/world.js').default} world - The game world instance.
 * @property {object} shaders - Shader programs for the game.
 * @property {object} effects - Visual effects for the game.
 * @property {boolean} loaded - Indicates if the game resources are loaded.
 * @property {object} [manifest] - Game manifest with network settings.
 */

/**
 * Core Pixos Graphics & Game Engine.
 * Orchestrates the main game loop, rendering, input handling, and resource management.
 */
export default class GLEngine {
  /**
   * Creates an instance of GLEngine.
   * @param {HTMLCanvasElement} canvas - The main WebGL canvas.
   * @param {HTMLCanvasElement} hudCanvas - The 2D canvas for HUD elements.
   * @param {HTMLCanvasElement} mipmap - The canvas for mipmap generation (or similar utility).
   * @param {HTMLCanvasElement} gamepadCanvas - The 2D canvas for mobile gamepad controls.
   * @param {HTMLInputElement} fileUpload - The file input element for resource loading.
   * @param {number} width - The desired width of the game viewport.
   * @param {number} height - The desired height of the game viewport.
   */
  constructor(canvas, hudCanvas, mipmap, gamepadCanvas, fileUpload, width, height) {
    /** @type {HTMLCanvasElement} */
    this.canvas = canvas;
    /** @type {HTMLCanvasElement} */
    this.hudCanvas = hudCanvas;
    /** @type {HTMLCanvasElement} */
    this.gamepadCanvas = gamepadCanvas;
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

    /** @type {NetworkManager} */
    this.networkManager = new NetworkManager(this);

    /** @type {ResourceManager} */
    this.resourceManager = new ResourceManager(this);

    /** @type {RenderManager} */
    this.renderManager = new RenderManager(this);

    /** @type {Hud} */
    this.hud = new Hud(this);

    /** @type {InputManager} */
    this.inputManager = new InputManager(this); // Initialize InputManager

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

    // Game Loop
    /** @type {boolean} */
    this.running = false;

    /** @type {WebGL2RenderingContext|null} */
    this.gl = null;
    /** @type {CanvasRenderingContext2D|null} */
    this.ctx = null;
    /** @type {CanvasRenderingContext2D|null} */
    this.gp = null;
    /** @type {number} */
    this.frameCount = 0;
    /** @type {SpritzGame|null} */
    this.spritz = null;
    /** @type {boolean} */
    this.fullscreen = false;
    /** @type {number} */
    this.time = 0;
    /** @type {number|null} */
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
    /** @type {CanvasRenderingContext2D|null} */
    const ctx = this.hudCanvas.getContext('2d');
    /** @type {WebGL2RenderingContext|null} */
    const gl = this.canvas.getContext('webgl2', {
      antialias: true,
      depth: true,
      preserveDrawingBuffer: false
    });
    /** @type {CanvasRenderingContext2D|null} */
    const gp = this.gamepadCanvas.getContext('2d');

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

    /** @type {WebGL2RenderingContext} */
    this.gl = gl;
    /** @type {CanvasRenderingContext2D} */
    this.ctx = ctx;
    /** @type {CanvasRenderingContext2D} */
    this.gp = gp;
    this.frameCount = 0;

    this.spritz = spritz;
    this.fullscreen = false;

    // Initial time
    this.time = new Date().getTime();

    // Init Input Manager
    this.inputManager.init();

    // Initialize HUD
    this.hud.init();

    // Initialize render manager
    this.renderManager.init();

    // Configure Gamepad & touch - now handled through InputManager
    // Direct access deprecated, use inputManager instead
    /** @deprecated Use inputManager.gamepad instead. */
    this.gamepad = this.inputManager.gamepad;
    /** @deprecated Use inputManager.keyboard instead. */
    this.keyboard = this.inputManager.keyboard;
    /** @deprecated Use inputManager.mouse instead. */
    this.mouse = this.inputManager.mouse;
    /** @deprecated Use inputManager.touch instead. */
    this.touch = this.inputManager.touch;

    /** @deprecated Eventually move this into inputManager.touch instead. */
    this.touchHandler = this.gamepad.listen.bind(this.gamepad);


    // Initialize network if enabled
    if (spritz.manifest?.network?.enabled) {
      await this.networkManager.connect(spritz.manifest.network.url);
      if (spritz.manifest.network.authority) {
        this.networkManager.setAuthority(spritz.manifest.network.authority);
      }
    }

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
   * Called continuously via `requestAnimationFrame` to update and draw the game.
   * Handles debug counters, clears canvases, updates game state, renders the scene, and manages transitions.
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

    // Update Input Manager
    this.inputManager.update();

    // Object picking pass (for selection) - only if mode has picker enabled
    if (this.modeManager.hasPicker()) {
      // Enable picker shader (Todo - Improve performance - make it only 1x1 pixel framebuffer - and avoid needing to reclear screen).
      this.renderManager.activatePickerShaderProgram(false);
      this.spritz.render(this, timestamp); // Render scene for picking pass
      // Read pixel data immediately after picking render, before clearing screen
      this.getSelectedObject('sprite|object|tile', false);
    }

    // Update and render based on the active game mode
    if (!this.inputManager.handleInput(timestamp)) {
      // If mode doesn't handle input, do default update
      this.spritz.update(timestamp);
    }

    // Sync input mode with game mode
    const currentMode = this.modeManager.getMode();
    if (currentMode && this.inputManager.getMode() !== currentMode) {
      this.inputManager.setMode(currentMode);
    }

    // Core render loop (actually render scene to screen)
    const gl = this.renderManager.engine.gl;
    this.renderManager.clearScreen();
    // Draw skybox first, with depth writes disabled
    gl.depthMask(false);
    this.renderManager.renderSkybox();
    gl.depthMask(true);
    // Now draw world tiles/objects, then sprites
    this.renderManager.activateShaderProgram();

    this.modeManager.update(timestamp); // Update active mode

    // Allow particle system to update physics with a stable timestamp
    if (this.renderManager && this.renderManager.updateParticles) {
      try { this.renderManager.updateParticles(timestamp); } catch (e) { console.warn('updateParticles failed', e); }
    }

    this.spritz.render(this); // Render scene (might be overridden by mode)

    this.cutsceneManager.update(); // Update cutscene (if applicable)
    this.renderManager.updateTransition(); // Update transitions

    // Render particles after main scene but before HUD/gamepad
    if (this.renderManager && this.renderManager.renderParticles) {
      try { this.renderManager.renderParticles(); } catch (e) { console.warn('renderParticles failed', e); }
    }
    this.gamepad.render(); // Render gamepad (may be optimizable?)

    // Update debug overlay if enabled
    updateDebugInformation(this);

    this.requestId = requestAnimationFrame(this.render);
  }

  /**
   * Stops the main render loop.
   */
  close() {
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null;
    }
  }

  /**
   * Detects and returns the selected object on screen based on mouse/touch input.
   * Uses a color-picking technique where objects are rendered with unique IDs to an off-screen buffer,
   * and the pixel under the cursor is read to identify the object.
   * @param {'sprite'|'object'|'tile'|string} [type='sprite|object|tile'] - The type(s) of objects to consider for selection, pipe-separated.
   * @param {boolean} [useFrustum=false] - Whether to use a 1x1 pixel frustum for picking (performance optimization).
   * @returns {number|null} The ID of the selected object, or null if no object is selected or freecam is active.
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

    // Only process selection if a left click occurred this frame
    if (!this.inputManager.isActionPressed('select')) {
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
                // Allow mode to handle selection first
                if (!this.modeManager.handleSelect(sprite.zone, sprite, null, 'sprite')) {
                  // TODO: Add a new trigger method onSelect()
                  if (typeof this.spritz.world.spriteDict[sprite.id].onSelect === 'function') {
                    this.spritz.world.spriteDict[sprite.id].onSelect(sprite.zone, sprite);
                  }
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
                // Allow mode to handle selection first
                if (!this.modeManager.handleSelect(obj.zone, obj, null, 'object')) {
                  // TODO: Add a new trigger method onSelect()
                  if (typeof this.spritz.world.objectDict[obj.id].onSelect === 'function') {
                    this.spritz.world.objectDict[obj.id].onSelect(obj.zone, obj);
                  }
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
              // Allow mode to handle selection first
              if (!this.modeManager.handleSelect(zone, row, cell, 'tile')) {
                if (typeof zone.onSelect === 'function') {
                  zone.onSelect(row, cell);
                }
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
   * @param {SpeechSynthesisVoice|null} [voice=null] - The voice to use. Defaults to the first available voice.
   * @param {string} [lang='en'] - The language of the speech.
   * @param {number|null} [rate=null] - The speed of the speech (0.1 to 10).
   * @param {number|null} [volume=null] - The volume of the speech (0 to 1).
   * @param {number|null} [pitch=null] - The pitch of the speech (0 to 2).
   */
  speechSynthesis(text, voice = null, lang = 'en', rate = null, volume = null, pitch = null) {
    /** @type {SpeechSynthesisUtterance} */
    let speech = this.voice;
    /** @type {SpeechSynthesisVoice[]} */
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
