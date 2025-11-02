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
 * @fileoverview Pixos Cutscene Manager
 *
 * This minimal manager supports registering named cutscenes composed of
 * sequential steps (wait, transition, load zone). A cutscene can be
 * started via the engine API or Lua and will run asynchronously,
 * blocking player input until complete. Additional step types can be
 * added as needed.
 */

  /**
   * @typedef {object} CutsceneStep
   * @property {string} type - The type of step ('wait', 'transition', 'load_zone', 'action', 'set_backdrop', 'show_cutout').
   * @property {number} [ms] - Milliseconds to wait (for 'wait' type).
   * @property {string} [effect] - Transition effect (for 'transition' and 'load_zone' types).
   * @property {string} [direction] - Transition direction ('in' or 'out', for 'transition' type).
   * @property {number} [duration] - Transition duration in ms (for 'transition' and 'load_zone' types).
   * @property {string} [zone] - Zone name to load (for 'load_zone' type).
   * @property {boolean} [remotely] - Whether to load remotely (for 'load_zone' type).
   * @property {string} [zip] - Zip archive for zone loading (for 'load_zone' type).
   * @property {function(): Promise<void>} [action] - Action function to run (for 'action' type).
   * @property {string} [backdrop] - Backdrop label to set (for 'set_backdrop' type).
   * @property {string} [sprite] - Sprite ID for cutout (for 'show_cutout' type).
   * @property {string} [cutout] - Cutout label (for 'show_cutout' type).
   * @property {string} [position] - Position ('left' or 'right') for cutout (for 'show_cutout' type).
   */

/**
 * CutsceneManager - Manages cutscenes in the Pixos game engine.
 * Supports registering and playing sequential cutscene steps asynchronously.
 */
export default class CutsceneManager {
  /**
   * Creates an instance of CutsceneManager.
   * @param {import('../index.js').default} engine - The main game engine instance.
   */
  constructor(engine) {
    /** @type {import('../index.js').default} */
    this.engine = engine;
    /** @type {Object.<string, CutsceneStep[]>} */
    this.scenes = {}; // Registered cutscenes: name -> array of steps
    /** @type {CutsceneStep[]} */
    this.queue = []; // Queue of steps for the currently active cutscene
    /** @type {boolean} */
    this.active = false;
    /** @type {Promise<void>|null} */
    this._currentPromise = null;
    /** @type {string|null} */
    this.currentBackdrop = null; // Current backdrop label
    /** @type {Array} */
    this.currentCutouts = []; // Array of {sprite, cutout, position} objects
  }

  /**
   * Registers a cutscene definition.
   * @param {string} name - The name of the cutscene.
   * @param {CutsceneStep[]} steps - The array of cutscene steps.
   */
  register = (name, steps) => {
    this.scenes[name] = Array.isArray(steps) ? steps.slice() : [];
  }

  /**
   * Starts playing a cutscene by name.
   * @param {string} name - The name of the cutscene to start.
   */
  start = (name) => {
    const def = this.scenes[name];
    if (!def) {
      console.warn('Cutscene not found:', name);
      return;
    }
    this.queue = def.slice();
    this.active = true;
    this._currentPromise = null;
    this.currentBackdrop = null; // Reset backdrop
    this.currentCutouts = []; // Reset cutouts
  }

  /**
   * Skips the active cutscene.
   */
  skip = () => {
    this.queue = [];
    this.active = false;
  }

  /**
   * Checks if a cutscene is running.
   * @returns {boolean} True if a cutscene is active.
   */
  isRunning = () => {
    return this.active;
  }

  /**
   * Updates the cutscene manager each frame.
   */
  update = () => {
    if (!this.active) return;
    // if a step is currently processing, wait
    if (this._currentPromise) return;
    const step = this.queue.shift();
    if (!step) {
      this.active = false;
      return;
    }
    // execute step and on completion call update again to process next
    let promise;
    switch (step.type) {
      // todo -- add addiitonal step support:
      // -- Thinking along the lines of run script, dialogue, picker, music, sprite and object actions, etc.
      // -- in theory should be able to script a scene, set flags too, and have it proceed to the next scene if
      // -- if another one follows. -- I should be able to script a basic 'movie' using this
      case 'action':
        promise = this.runAction(step);
        break;
      case 'wait':
        promise = this.wait(step.ms || 0);
        break;
      case 'transition':
        promise = this.transition(step);
        break;
      case 'load_zone':
        promise = this.loadZone(step);
        break;
      case 'set_backdrop':
        promise = this.setBackdrop(step);
        break;
      case 'show_cutout':
        promise = this.showCutout(step);
        break;
      default:
        console.warn('Unknown cutscene step:', step.type);
        promise = Promise.resolve();
    }
    this._currentPromise = promise;
    promise.then(() => {
      this._currentPromise = null;
      this.update();
    });
  }

  /**
   * Waits for a specified number of milliseconds.
   * @param {number} ms - The milliseconds to wait.
   * @returns {Promise<void>} A promise that resolves after the wait.
   */
  wait = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Handles a transition step.
   * @param {CutsceneStep} step - The transition step.
   * @returns {Promise<void>} A promise that resolves when the transition completes.
   */
  transition = (step) => {
    const rm = this.engine.renderManager;
    if (!rm) return Promise.resolve();
    const effect = step.effect || 'fade';
    const direction = step.direction || 'out';
    const duration = step.duration || 500;
    return rm.startTransition({ effect, direction, duration });
  }

  /**
   * Runs an action step.
   * @param {CutsceneStep} step - The action step.
   * @returns {Promise<void>} A promise that resolves when the action completes.
   */
  runAction = (step) => {
    const action = step.action;
    if (!action) return Promise.resolve();
    return action();
  }

  /**
   * Loads a zone as part of a cutscene.
   * @param {CutsceneStep} step - The load_zone step.
   * @returns {Promise<void>} A promise that resolves when the zone is loaded.
   */
  loadZone = (step) => {
    const { zone, remotely = false, zip } = step;
    if (!zone || !this.engine.spritz || !this.engine.spritz.world) {
      return Promise.resolve();
    }
    const effect = step.effect || 'fade';
    const duration = step.duration || 500;
    if (zip) {
      return this.engine.spritz.world.loadZoneFromZip(zone, zip, false, null);
    }
    return this.engine.spritz.world.loadZone(zone, remotely, false, null);
  }

  /**
   * Sets the backdrop for the cutscene.
   * @param {CutsceneStep} step - The set_backdrop step.
   * @returns {Promise<void>} A promise that resolves when the backdrop is set.
   */
  setBackdrop = (step) => {
    this.currentBackdrop = step.backdrop || null;
    return Promise.resolve();
  }

  /**
   * Shows a cutout in the cutscene.
   * @param {CutsceneStep} step - The show_cutout step.
   * @returns {Promise<void>} A promise that resolves when the cutout is shown.
   */
  showCutout = (step) => {
    const { sprite, cutout, position = 'left' } = step;
    if (sprite && cutout) {
      // Remove existing cutout for this sprite if any
      this.currentCutouts = this.currentCutouts.filter(c => c.sprite !== sprite);
      // Add new cutout
      this.currentCutouts.push({ sprite, cutout, position });
    }
    return Promise.resolve();
  }
}
