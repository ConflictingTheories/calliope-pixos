/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2022 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
import GLEngine from '@Engine/core/index.jsx';

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
  }

  onKeyUp(e) {
    let c = String.fromCharCode(e.keyCode).toLowerCase();
    let index = Keyboard._instance.activeKeys.indexOf(c);
    Keyboard._instance.activeKeys.splice(index, 1);
    Keyboard._instance.activeCodes.splice(index, 1);
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
