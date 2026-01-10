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
   * @typedef {object} ModeHandlers
   * @property {function(object): Promise<object|void>} [setup] - Function called when the mode is activated. Can return an object of additional handlers.
   * @property {function(object): Promise<void>} [teardown] - Function called when the mode is deactivated.
   * @property {function(number, object): Promise<void>} [update] - Function called every frame to update the mode's state.
   * @property {function(number, object): boolean} [checkInput] - Function to handle input events. Returns true if input was consumed.
   * @property {function(object, number, number, string, object): boolean} [onSelect] - Function to handle object selection events. Returns true to consume default selection.
   * @property {boolean} [picker] - Whether the mode should enable object picking.
   */

/**
 * ModeManager - manages game modes (explore, tactics, etc.).
 * Modes are backed by Lua scripts (setup & update) and can be attached
 * globally to the world or to individual zones. This manager allows for
 * dynamic switching between different game states, each with its own logic
 * for updates, input handling, and object selection.
 */
export default class ModeManager {
  /**
   * Creates an instance of ModeManager.
   * @param {import('../index.js').default} engine - The main game engine instance.
   */
  constructor(engine) {
    /** @type {import('../index.js').default} */
    this.engine = engine;
    /** @type {object|null} */
    this.currentMode = null; // { name, handlers: ModeHandlers, params }
    /** @type {Object.<string, ModeHandlers>} */
    this.registered = Object.create(null);
  }

  /**
   * Registers a new game mode with its associated handlers.
   * If the mode being registered is currently active and its handlers were not
   * present at the time of activation, its setup function will be run immediately.
   * @param {string} name - The unique name of the mode.
   * @param {ModeHandlers} handlers - An object containing setup, teardown, update, and input handlers for the mode.
   */
  register(name, handlers) {
    if (process.env.NODE_ENV === 'development') {
      console.log('ModeManager.register ->', name, 'hasSetup?', !!(handlers && handlers.setup), 'currentMode=', this.currentMode?.name);
    }
    this.registered[name] = handlers;
    // If this mode is currently active but handlers were not present at set-time,
    // run its setup now so late-registered modes still initialize correctly.
    if (this.currentMode && this.currentMode.name === name) {
      const params = this.currentMode.params || {};
      (async () => {
        try {
          const h = this.registered[name];
          this.currentMode.handlers = h;
          if (h && h.setup) {
            const res = await h.setup(params);
            if (res && typeof res === 'object') {
              Object.assign(h, res);
              this.registered[name] = h;
              this.currentMode.handlers = h;
            }
          }
        } catch (e) {
          console.warn(`Mode late-register setup failed for mode "${name}":`, e);
        }
      })();
    }
  }

  /**
   * Sets the active game mode. This will tear down the previous mode (if any)
   * and set up the new mode.
   * @param {string} name - The name of the mode to activate.
   * @param {object} [params={}] - Parameters to pass to the mode's setup and update functions.
   * @returns {Promise<void>} A promise that resolves when the mode has been set up.
   */
  async set(name, params = {}) {
    if (!name) return;
    // Teardown previous mode
    if (this.currentMode && this.currentMode.handlers?.teardown) {
      try {
        await this.currentMode.handlers.teardown(params);
      } catch (e) {
        console.warn(`Mode teardown failed for mode "${this.currentMode.name}":`, e);
      }
    }

    if (!this.registered[name]) {
      console.warn(`Warning: Mode "${name}" has not been registered.`);
    }

    const handlers = this.registered[name] || {};
    this.currentMode = { name, handlers, params };
    if (process.env.NODE_ENV === 'development') {
      console.log('ModeManager: set mode ->', name, params, handlers);
    }

    if (handlers.setup) {
      try {
        // Allow setup to optionally return an object of handlers
        const res = await handlers.setup(params);
        if (res && typeof res === 'object') {
          // Merge returned handlers into the active handlers so checkInput/onSelect/etc. are available
          Object.assign(handlers, res);
          // Update registration to reflect merged handlers
          this.registered[name] = handlers;
          this.currentMode.handlers = handlers;
        }
      } catch (e) {
        console.warn(`Mode setup failed for mode "${name}":`, e);
      }
    }
  }

  /**
   * Updates the currently active game mode. This method should be called
   * once per frame by the game engine's main loop.
   * @param {number} time - The current game time.
   * @returns {Promise<void>} A promise that resolves after the mode's update function has run.
   */
  async update(time) {
    if (!this.currentMode) return;
    const h = this.currentMode.handlers;
    if (h && h.update) {
      try {
        await h.update(time, this.currentMode.params);
      } catch (e) {
        console.warn(`Mode update failed for mode "${this.currentMode.name}":`, e);
      }
    }
  }

  /**
   * Allows the active mode to handle input events.
   * @param {number} time - The current game time.
   * @returns {boolean} True if the input was consumed by the mode, false otherwise.
   */
  handleInput(time) {
    if (!this.currentMode) return false;
    const handlers = this.currentMode.handlers;
    if (process.env.NODE_ENV === 'development') {
      console.log('ModeManager.handleInput: current handlers ->', handlers);
    }
    try {
      if (handlers && handlers.checkInput) return !!handlers.checkInput(time, this.currentMode.params);
    } catch (e) {
      console.warn(`Mode input handler failed for mode "${this.currentMode.name}":`, e);
    }
    return false;
  }

  /**
   * Allows the active mode to handle object selection events (tiles, sprites, etc.).
   * @param {object} zone - The zone object where the selection occurred.
   * @param {number} row - The row index of the selected tile/object.
   * @param {number} cell - The cell index of the selected tile/object.
   * @param {string} type - The type of object selected ('tile', 'sprite', 'object').
   * @returns {boolean} True if the selection was consumed by the mode, false otherwise.
   */
  handleSelect(zone, row, cell, type) {
    if (!this.currentMode) return false;
    const handlers = this.currentMode.handlers;
    if (process.env.NODE_ENV === 'development') {
      console.log('ModeManager.handleSelect: current handlers ->', handlers);
    }
    try {
      if (handlers && handlers.onSelect) return !!handlers.onSelect(zone, row, cell, type, this.currentMode.params);
    } catch (e) {
      console.warn(`Mode onSelect handler failed for mode "${this.currentMode.name}":`, e);
    }
    return false;
  }

  /**
   * Returns the name of the currently active game mode.
   * @returns {string|null} The name of the current mode, or null if no mode is active.
   */
  getMode() {
    return this.currentMode?.name || null;
  }

  /**
   * Checks if the current mode has picker enabled.
   * @returns {boolean} True if picker is enabled for the current mode.
   */
  hasPicker() {
    return this.currentMode?.handlers?.picker === true;
  }
}
