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
 * @typedef {object} MousePosition
 * @property {number} x - X coordinate.
 * @property {number} y - Y coordinate.
 */

/**
 * @typedef {object} MouseMovement
 * @property {number} x - X movement delta.
 * @property {number} y - Y movement delta.
 */

/**
 * @callback MouseHookCallback
 * @param {MouseEvent} event - The raw mouse event.
 * @param {'down'|'up'|'move'} type - The type of event.
 * @returns {void}
 */

/**
 * Mouse - Manages mouse input for the Pixos game engine.
 * Tracks button states, position, and movement, and allows custom hooks for raw events.
 */
export default class Mouse {
  /**
   * Creates an instance of Mouse.
   * @param {import('../index.js').default} engine - The main game engine instance.
   * @returns {Mouse} The singleton instance of the Mouse manager.
   */
  constructor(engine) {
    if (!Mouse._instance) {
      /** @type {import('../index.js').default} */
      this.engine = engine;
      /** @type {boolean[]} */
      this.buttons = [false, false, false]; // Left, Middle, Right
      /** @type {MousePosition} */
      this.position = { x: 0, y: 0 };
      /** @type {MouseMovement} */
      this.movement = { x: 0, y: 0 };
  /** @type {MouseHookCallback[]} */
  this._hooks = []; // raw mouse event hooks
      Mouse._instance = this;
    }
    return Mouse._instance;
  }

  /**
   * Initializes mouse event listeners on the canvas.
   * @returns {void}
   */
  init() {
    /** @type {HTMLCanvasElement} */
    const canvas = this.engine.canvas;
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    // Prevent context menu on right click
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /**
   * Handles the `mousedown` event.
   * @param {MouseEvent} e - The mouse event.
   * @returns {void}
   */
  onMouseDown(e) {
    e.preventDefault();
    const canvas = e.target; // Use the actual event target
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    this.position.x = (e.clientX - rect.left) * scaleX;
    this.position.y = (e.clientY - rect.top) * scaleY;
    if (e.button >= 0 && e.button < 3) {
      this.buttons[e.button] = true;
      if (process.env.NODE_ENV === 'development') console.log('mouse:onMouseDown', e.button, this.position);
    }
    this._notifyHooks(e, 'down');
  }

  /**
   * Handles the `mouseup` event.
   * @param {MouseEvent} e - The mouse event.
   * @returns {void}
   */
  onMouseUp(e) {
    e.preventDefault();
    const canvas = e.target; // Use the actual event target
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    this.position.x = (e.clientX - rect.left) * scaleX;
    this.position.y = (e.clientY - rect.top) * scaleY;
    if (e.button >= 0 && e.button < 3) {
      this.buttons[e.button] = false;
      if (process.env.NODE_ENV === 'development') console.log('mouse:onMouseUp', e.button, this.position);
    }
    this._notifyHooks(e, 'up');
  }

  /**
   * Handles the `mousemove` event.
   * @param {MouseEvent} e - The mouse event.
   * @returns {void}
   */
  onMouseMove(e) {
  const canvas = e.target; // Use the actual event target
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const newX = (e.clientX - rect.left) * scaleX;
  const newY = (e.clientY - rect.top) * scaleY;
  this.movement.x = newX - this.position.x;
  this.movement.y = newY - this.position.y;
  this.position.x = newX;
  this.position.y = newY;
  this._notifyHooks(e, 'move');
  }

  /**
   * Notifies registered hooks about a mouse event.
   * @param {MouseEvent} event - The event object.
   * @param {'down'|'up'|'move'} type - The event type.
   * @private
   * @returns {void}
   */
  _notifyHooks(event, type) {
    try {
      this._hooks.forEach((h) => {
        try { h(event, type); } catch (errInner) {
          if (process.env.NODE_ENV === 'development') console.warn('Error in mouse hook callback:', errInner);
        }
      });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Error while notifying mouse hooks (${type}):`, err);
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
   * @returns {MousePosition} The current position.
   */
  getPosition() {
    return this.position;
  }

  /**
   * Gets the latest mouse movement delta.
   * @returns {MouseMovement} The movement delta.
   */
  getMovement() {
    return this.movement;
  }

  /**
   * Registers a raw mouse event hook.
   * @param {MouseHookCallback} cb - The callback function.
   * @returns {void}
   */
  addHook(cb) {
  if (typeof cb === 'function') this._hooks.push(cb);
  }

  /**
   * Removes a raw mouse event hook.
   * @param {MouseHookCallback} cb - The callback function.
   * @returns {void}
   */
  removeHook(cb) {
    const i = this._hooks.indexOf(cb);
    if (i >= 0) this._hooks.splice(i, 1);
  }
}
