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
 * @callback TouchHookCallback
 * @param {TouchEvent} event - The raw touch event.
 * @param {'start'|'move'|'end'} type - The type of event.
 */

/**
 * Touch - Manages touch input for the game engine.
 * This class tracks touch positions, gestures, and allows for custom hooks.
 */
export default class Touch {
  /**
   * Creates an instance of Touch.
   * @param {GLEngine} engine - The main game engine instance.
   * @returns {Touch} The singleton instance of the Touch manager.
   */
  constructor(engine) {
    if (!Touch._instance) {
      /** @type {GLEngine} */
      this.engine = engine;
      /** @type {Touch[]} */
      this.touches = [];
      /** @type {Object.<string, boolean>} */
      this.gestures = {}; // Active gestures
      /** @type {TouchHookCallback[]} */
      this.hooks = [];
      /** @type {number} */
      this.startTime = 0;
      /** @type {{x: number, y: number}} */
      this.startPos = { x: 0, y: 0 };
      Touch._instance = this;
    }
    return Touch._instance;
  }

  /**
   * Initializes touch event listeners on the canvas.
   */
  init() {
    const canvas = this.engine.canvas;
    canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
  }

  /**
   * Handles the `touchstart` event.
   * @param {TouchEvent} e - The touch event.
   */
  onTouchStart(e) {
    e.preventDefault();
    this.touches = Array.from(e.touches);
    if (this.touches.length === 1) {
      const touch = this.touches[0];
      this.startTime = Date.now();
      this.startPos = { x: touch.clientX, y: touch.clientY };
    }
    this._notifyHooks(e, 'start');
  }

  /**
   * Handles the `touchmove` event.
   * @param {TouchEvent} e - The touch event.
   */
  onTouchMove(e) {
    e.preventDefault();
    this.touches = Array.from(e.touches);
    this._notifyHooks(e, 'move');
  }

  /**
   * Handles the `touchend` event.
   * @param {TouchEvent} e - The touch event.
   */
  onTouchEnd(e) {
    e.preventDefault();
    this.touches = Array.from(e.touches);
    if (this.touches.length === 0 && this.startTime > 0) {
      const duration = Date.now() - this.startTime;
      const touch = e.changedTouches[0];
      const endPos = { x: touch.clientX, y: touch.clientY };
      const deltaX = endPos.x - this.startPos.x;
      const deltaY = endPos.y - this.startPos.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Detect gestures
      if (duration < 300 && distance < 10) {
        this.gestures['tap'] = true;
        setTimeout(() => delete this.gestures['tap'], 100);
      } else if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          this.gestures['swipe_right'] = true;
          setTimeout(() => delete this.gestures['swipe_right'], 100);
        } else {
          this.gestures['swipe_left'] = true;
          setTimeout(() => delete this.gestures['swipe_left'], 100);
        }
      } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          this.gestures['swipe_down'] = true;
          setTimeout(() => delete this.gestures['swipe_down'], 100);
        } else {
          this.gestures['swipe_up'] = true;
          setTimeout(() => delete this.gestures['swipe_up'], 100);
        }
      }
    }
    this._notifyHooks(e, 'end');
  }

  /**
   * Notifies registered hooks about a touch event.
   * @param {TouchEvent} event - The event object.
   * @param {'start'|'move'|'end'} type - The event type.
   * @private
   */
  _notifyHooks(event, type) {
    try {
      this.hooks.forEach(h => h(event, type));
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Error in touch hook (${type}):`, err);
      }
    }
  }

  /**
   * Checks if a specific gesture is currently active.
   * @param {string} gesture - The gesture to check (e.g., 'tap', 'swipe_left').
   * @returns {boolean} True if the gesture is active.
   */
  isGestureActive(gesture) {
    return !!this.gestures[gesture];
  }

  /**
   * Gets the current touches.
   * @returns {Touch[]} Array of current touches.
   */
  getTouches() {
    return this.touches;
  }

  /**
   * Registers a raw touch event hook.
   * @param {TouchHookCallback} cb - The callback function.
   */
  addHook(cb) {
    if (cb) this.hooks.push(cb);
  }

  /**
   * Removes a raw touch event hook.
   * @param {TouchHookCallback} cb - The callback function.
   */
  removeHook(cb) {
    const i = this.hooks.indexOf(cb);
    if (i >= 0) this.hooks.splice(i, 1);
  }
}
