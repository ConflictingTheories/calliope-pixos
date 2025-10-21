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
 * @callback MouseHookCallback
 * @param {MouseEvent} event - The raw mouse event.
 * @param {'down'|'up'|'move'} type - The type of event.
 */

/**
 * Mouse - Manages mouse input for the game engine.
 * This class tracks button states, position, and movement,
 * and allows for custom hooks to be registered for raw mouse events.
 */
export default class Mouse {
  /**
   * Creates an instance of Mouse.
   * @param {GLEngine} engine - The main game engine instance.
   * @returns {Mouse} The singleton instance of the Mouse manager.
   */
  constructor(engine) {
    if (!Mouse._instance) {
      /** @type {GLEngine} */
      this.engine = engine;
      /** @type {boolean[]} */
      this.buttons = [false, false, false]; // Left, Middle, Right
      /** @type {{x: number, y: number}} */
      this.position = { x: 0, y: 0 };
      /** @type {{x: number, y: number}} */
      this.movement = { x: 0, y: 0 };
      /** @type {MouseHookCallback[]} */
      this._hooks = [];
      Mouse._instance = this;
    }
    return Mouse._instance;
  }

  /**
   * Initializes mouse event listeners on the window.
   */
  init() {
    const canvas = this.engine.canvas;
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    // Optional: context menu prevention
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /**
   * Handles the `mousedown` event.
   * @param {MouseEvent} e - The mouse event.
   */
  onMouseDown(e) {
    e.preventDefault();
    if (e.button >= 0 && e.button < 3) {
      this.buttons[e.button] = true;
    }
    this._notifyHooks(e, 'down');
  }

  /**
   * Handles the `mouseup` event.
   * @param {MouseEvent} e - The mouse event.
   */
  onMouseUp(e) {
    e.preventDefault();
    if (e.button >= 0 && e.button < 3) {
      this.buttons[e.button] = false;
    }
    this._notifyHooks(e, 'up');
  }

  /**
   * Handles the `mousemove` event.
   * @param {MouseEvent} e - The mouse event.
   */
  onMouseMove(e) {
    this.position.x = e.clientX;
    this.position.y = e.clientY;
    this.movement.x = e.movementX;
    this.movement.y = e.movementY;
    this._notifyHooks(e, 'move');
  }

  /**
   * Notifies registered hooks about a mouse event.
   * @param {MouseEvent} event - The event object.
   * @param {'down'|'up'|'move'} type - The event type.
   * @private
   */
  _notifyHooks(event, type) {
    try {
      this._hooks.forEach((h) => h(event, type));
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Error in mouse hook (${type}):`, err);
      }
    }
  }

  /**
   * Checks if a specific mouse button is currently pressed.
   * @param {number|string} button - The button to check (0 for left, 1 for middle, 2 for right, or 'left', 'middle', 'right').
   * @returns {boolean} True if the button is pressed.
   */
  isButtonPressed(button) {
    const buttonMap = { 'left': 0, 'middle': 1, 'right': 2 };
    if (typeof button === 'string') {
      button = buttonMap[button];
    }
    return this.buttons[button] || false;
  }

  /**
   * Gets the current mouse position.
   * @returns {{x: number, y: number}}
   */
  getPosition() {
    return this.position;
  }

  /**
   * Gets the latest mouse movement delta.
   * @returns {{x: number, y: number}}
   */
  getMovement() {
    return this.movement;
  }

  /**
   * Registers a raw mouse event hook.
   * @param {MouseHookCallback} cb - The callback function.
   */
  addHook(cb) {
    if (cb) this._hooks.push(cb);
  }

  /**
   * Removes a raw mouse event hook.
   * @param {MouseHookCallback} cb - The callback function.
   */
  removeHook(cb) {
    const i = this._hooks.indexOf(cb);
    if (i >= 0) this._hooks.splice(i, 1);
  }
}
