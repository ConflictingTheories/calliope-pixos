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
import GLEngine from '@Engine/core/index.js';

/**
 * @callback KeyboardHookCallback
 * @param {KeyboardEvent} event - The raw keyboard event.
 * @param {'down'|'up'} type - The type of event ('down' for keydown, 'up' for keyup).
 */

/**
 * Keyboard - Manages keyboard input for the game engine.
 * This class tracks active keys, provides methods to check key states,
 * and allows for custom hooks to be registered for raw keyboard events.
 */
export default class Keyboard {
  /**
   * Creates an instance of Keyboard.
   * @param {GLEngine} engine - The main game engine instance.
   * @returns {Keyboard} The singleton instance of the Keyboard manager.
   */
  constructor(engine) {
    // Ensure singleton instance
    if (!Keyboard._instance) {
      /** @type {string[]} */
      this.activeKeys = []; // Stores lowercase character codes of currently pressed keys
      /** @type {string[]} */
      this.activeCodes = []; // Stores `event.key` values of currently pressed keys
      /** @type {KeyboardHookCallback[]} */
      this._hooks = []; // Registered callbacks for raw key events
      /** @type {boolean} */
      this.shift = false; // True if Shift key is currently pressed
      /** @type {GLEngine} */
      this.engine = engine;
      Keyboard._instance = this;
    }
    return Keyboard._instance;
  }

  /**
   * Initializes keyboard event listeners on the window.
   * This should be called once during engine setup.
   */
  init() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  /**
   * Handles the `keydown` event. Adds the pressed key to active lists and notifies hooks.
   * @param {KeyboardEvent} e - The keyboard event.
   */
  onKeyDown(e) {
    e.preventDefault();
    const c = String.fromCharCode(e.keyCode).toLowerCase();
    if (Keyboard._instance.activeKeys.indexOf(c) < 0) {
      Keyboard._instance.activeKeys.push(c);
    }
    if (Keyboard._instance.activeCodes.indexOf(e.key) < 0) {
      Keyboard._instance.activeCodes.push(e.key);
    }
    Keyboard._instance.shift = e.shiftKey;
    // Notify hooks (debug / custom controls) about raw key event
    try {
      (Keyboard._instance._hooks || []).forEach((h) => h(e, 'down'));
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error in keyboard hook (keydown):', err);
      }
    }
  }

  /**
   * Handles the `keyup` event. Removes the released key from active lists and notifies hooks.
   * @param {KeyboardEvent} e - The keyboard event.
   */
  onKeyUp(e) {
    const c = String.fromCharCode(e.keyCode).toLowerCase();
    let index = Keyboard._instance.activeKeys.indexOf(c);
    if (index > -1) {
      Keyboard._instance.activeKeys.splice(index, 1);
    }
    // Remove from activeCodes as well
    index = Keyboard._instance.activeCodes.indexOf(e.key);
    if (index > -1) {
      Keyboard._instance.activeCodes.splice(index, 1);
    }
    Keyboard._instance.shift = e.shiftKey;
    try {
      (Keyboard._instance._hooks || []).forEach((h) => h(e, 'up'));
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error in keyboard hook (keyup):', err);
      }
    }
  }

  /**
   * Registers a raw key event hook.
   * @param {KeyboardHookCallback} cb - The callback function to register.
   */
  addHook(cb) {
    if (!cb) return;
    this._hooks = this._hooks || []; // Ensure _hooks is initialized
    this._hooks.push(cb);
  }

  /**
   * Removes a previously registered raw key event hook.
   * @param {KeyboardHookCallback} cb - The callback function to remove.
   */
  removeHook(cb) {
    if (!cb || !this._hooks) return;
    const i = this._hooks.indexOf(cb);
    if (i >= 0) {
      this._hooks.splice(i, 1);
    }
  }

  /**
   * Checks if a specific key (by character) is currently pressed.
   * @param {string} key - The character of the key to check (e.g., 'w').
   * @returns {boolean} True if the key is currently pressed.
   */
  isKeyPressed(key) {
    return this.activeKeys.includes(key.toLowerCase());
  }

  /**
   * Checks if a specific key (by code, e.g., 'ArrowLeft') is currently pressed.
   * @param {string} code - The `key` property from a KeyboardEvent.
   * @returns {boolean} True if the key is currently pressed.
   */
  isCodePressed(code) {
    return this.activeCodes.includes(code);
  }

  /**
   * Returns the last pressed key from a provided list of keys.
   * @param {string} keys - A string of keys to check (e.g., 'wasd').
   * @returns {string|null} The last pressed key from the list, or null if none are pressed.
   */
  lastPressed(keys) {
    const lower = keys.toLowerCase();
    let max = null;
    let maxI = -1;
    for (let i = 0; i < lower.length; i++) {
      const k = lower[i];
      const index = Keyboard._instance.activeKeys.indexOf(k);
      if (index > maxI) {
        max = k;
        maxI = index;
      }
    }
    return max;
  }

  /**
   * Returns the last pressed key code (from `event.key`) that is not in the ignore list.
   * Note: This method modifies `activeCodes` by popping elements. Consider `peekLastPressedCode` for non-destructive check.
   * @param {string} [ignore=''] - A string of key codes to ignore.
   * @returns {string|null} The last pressed key code, or null if none are found or all are ignored.
   */
  lastPressedCode(ignore = '') {
    // This method's logic seems to be intended to return the *most recently pressed* key
    // that is not in the ignore list, by repeatedly popping from `activeCodes`.
    // This is a destructive operation on `activeCodes`.
    let last = null;
    const lowerIgnore = ignore.toLowerCase();
    while (Keyboard._instance.activeCodes.length > 0) {
      last = Keyboard._instance.activeCodes.pop();
      if (lowerIgnore.indexOf(last.toLowerCase()) === -1) {
        return last;
      }
    }
    return null;
  }

  /**
   * Returns the last pressed key (from `String.fromCharCode(e.keyCode)`) from the active keys list.
   * @returns {string|null} The last pressed key, or null if no keys are active.
   */
  lastPressedKey() {
    return Keyboard._instance.activeKeys[Keyboard._instance.activeKeys.length - 1] || null;
  }
}
