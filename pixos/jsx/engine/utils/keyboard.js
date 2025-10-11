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

export default class Keyboard {
  /**
   *
   * @param {GLEngine} engine
   * @returns
   */
  constructor(engine) {
    // Instance
    if (!Keyboard._instance) {
      this.activeKeys = [];
      this.activeCodes = [];
      this._hooks = [];
      this.shift = false;
      this.engine = engine;
      Keyboard._instance = this;
    }
    return Keyboard._instance;
  }

  init() {
    // setup initial event listeners
  }

  onKeyDown(e) {
    e.preventDefault();
    let c = String.fromCharCode(e.keyCode).toLowerCase();
    if (Keyboard._instance.activeKeys.indexOf(c) < 0) Keyboard._instance.activeKeys.push(c);
    if (Keyboard._instance.activeCodes.indexOf(e.key) < 0) Keyboard._instance.activeCodes.push(e.key);
    Keyboard._instance.shift = e.shiftKey;
    // notify hooks (debug / custom controls) about raw key event
    try {
      (Keyboard._instance._hooks || []).forEach((h) => h(e, 'down'));
    } catch (err) { }
  }

  onKeyUp(e) {
    let c = String.fromCharCode(e.keyCode).toLowerCase();
    let index = Keyboard._instance.activeKeys.indexOf(c);
    Keyboard._instance.activeKeys.splice(index, 1);
    Keyboard._instance.activeCodes.splice(index, 1);
    try {
      (Keyboard._instance._hooks || []).forEach((h) => h(e, 'up'));
    } catch (err) { }
  }

  // Register a raw key event hook. Hook receives (event, type) where type is 'down' or 'up'
  addHook(cb) {
    if (!cb) return;
    this._hooks = this._hooks || [];
    this._hooks.push(cb);
  }

  removeHook(cb) {
    if (!cb || !this._hooks) return;
    const i = this._hooks.indexOf(cb);
    if (i >= 0) this._hooks.splice(i, 1);
  }

  // Return the last pressed key from provided keys
  lastPressed(keys) {
    let lower = keys.toLowerCase();
    let max = null;
    let maxI = -1;
    for (let i = 0; i < keys.length; i++) {
      let k = lower[i];
      let index = Keyboard._instance.activeKeys.indexOf(k);
      if (index > maxI) {
        max = k;
        maxI = index;
      }
    }
    return max;
  }

  // Return the last pressed key in keys
  lastPressedCode(ignore = '') {
    let last = Keyboard._instance.activeCodes.pop();
    let lower = ignore.toLowerCase();
    for (let i = 0; i < lower.length; i++) {
      let index = Keyboard._instance.activeKeys.indexOf(last);
      if (index < 0) {
        last = Keyboard._instance.activeCodes.pop();
      }
    }
    return last;
  }

  // Return the last pressed key in keys
  lastPressedKey() {
    return Keyboard._instance.activeKeys[Keyboard._instance.activeKeys.length - 1];
  }
}
