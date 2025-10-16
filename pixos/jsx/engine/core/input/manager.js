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

import Keyboard from '../../utils/keyboard.js';
import Mouse from '../../utils/mouse.js';
import { GamePad } from '../../utils/gamepad/index.js';

/**
 * @typedef {object} ActionMapping
 * @property {string} [keyboard] - Keyboard key for the action.
 * @property {string} [gamepad] - Gamepad button for the action.
 * @property {string} [mouse] - Mouse button for the action.
 * @property {string} [touch] - Touch gesture for the action.
 */

/**
 * @typedef {object} ModeMappings
 * @property {Object.<string, ActionMapping>} actions - Action mappings for the mode.
 */

/**
 * InputManager - Centralized input handling for keyboard, mouse, touch, and gamepad.
 * Supports mode-specific action mappings and hooks for scripting.
 */
export default class InputManager {
  /**
   * Creates an instance of InputManager.
   * @param {import('../index.js').default} engine - The main game engine instance.
   * @returns {InputManager} The singleton instance.
   */
  constructor(engine) {
    if (!InputManager._instance) {
      /** @type {import('../index.js').default} */
      this.engine = engine;
      /** @type {Keyboard} */
      this.keyboard = new Keyboard(engine);
      /** @type {Mouse} */
      this.mouse = new Mouse(engine);
      /** @type {GamePad} */
      this.gamepad = new GamePad(engine);
      /** @type {Object.<string, ModeMappings>} */
      this.mappings = {}; // Mode-specific mappings
      /** @type {Object.<string, function[]>} */
      this.hooks = {}; // Action hooks for scripting
      /** @type {string} */
      this.currentMode = 'default';
      /** @type {Object.<string, boolean>} */
      this.actionStates = {}; // Current state of actions
      /** @type {Object.<string, number>} */
      this.lastActionTime = {}; // Timestamp of last action trigger
      InputManager._instance = this;
    }
    return InputManager._instance;
  }

  /**
   * Initializes the InputManager.
   */
  init() {
    this.keyboard.init();
    this.mouse.init();
    this.gamepad.init();
    // Set default mappings
    this.setModeMappings('default', {
      actions: {
        move_up: { keyboard: 'w', gamepad: 'up' },
        move_down: { keyboard: 's', gamepad: 'down' },
        move_left: { keyboard: 'a', gamepad: 'left' },
        move_right: { keyboard: 'd', gamepad: 'right' },
        interact: { keyboard: 'k', gamepad: 'a' },
        camera_pan_left: { keyboard: 'ArrowLeft' },
        camera_pan_right: { keyboard: 'ArrowRight' },
        camera_pan_up: { keyboard: 'ArrowUp' },
        camera_pan_down: { keyboard: 'ArrowDown' },
        camera_zoom_in: { keyboard: 'q' },
        camera_zoom_out: { keyboard: 'e' },
        camera_rotate_left: { keyboard: 'z' },
        camera_rotate_right: { keyboard: 'x' },
        menu: { keyboard: 'm', gamepad: 'y' },
        run: { keyboard: 'r', gamepad: 'y' },
        bind_camera: { keyboard: 'b' },
        fixed_camera: { keyboard: 'c' },
        help: { keyboard: 'h' },
        chat: { keyboard: ' ' },
        clear_speech: { keyboard: 'Escape' },
        patrol: { keyboard: 'p' },
        dance: { keyboard: 'u' },
        height_up: { keyboard: 'y' },
        height_down: { keyboard: 'f' },
      },
    });

    // Mode-specific mappings
    this.setModeMappings('explore', {
      actions: {
        // Inherit defaults, add mode-specific
        camera_focus: { keyboard: 'f' },
      },
    });

    this.setModeMappings('tactics', {
      actions: {
        select_unit: { mouse: 'left' },
        move_unit: { mouse: 'right' },
        end_turn: { keyboard: 'Enter' },
      },
    });

    this.setModeMappings('fight', {
      actions: {
        attack: { keyboard: 'k', gamepad: 'a' },
        defend: { keyboard: 'd' },
        special: { keyboard: 's' },
      },
    });

    this.setModeMappings('fps', {
      actions: {
        look_left: { mouse: 'move_x_negative' },
        look_right: { mouse: 'move_x_positive' },
        look_up: { mouse: 'move_y_negative' },
        look_down: { mouse: 'move_y_positive' },
        move_forward: { keyboard: 'w' },
        move_backward: { keyboard: 's' },
        strafe_left: { keyboard: 'a' },
        strafe_right: { keyboard: 'd' },
        jump: { keyboard: ' ' },
        crouch: { keyboard: 'c' },
        shoot: { mouse: 'left' },
        reload: { keyboard: 'r' },
      },
    });

    this.setModeMappings('racing', {
      actions: {
        accelerate: { keyboard: 'w', gamepad: 'a' },
        brake: { keyboard: 's', gamepad: 'b' },
        steer_left: { keyboard: 'a', gamepad: 'left' },
        steer_right: { keyboard: 'd', gamepad: 'right' },
        boost: { keyboard: ' ' },
        handbrake: { keyboard: 'Shift' },
      },
    });
  }

  /**
   * Sets action mappings for a specific mode.
   * @param {string} mode - The mode name.
   * @param {ModeMappings} mappings - The mappings for the mode.
   */
  setModeMappings(mode, mappings) {
    this.mappings[mode] = mappings;
  }

  /**
   * Switches to a new input mode.
   * @param {string} mode - The mode to switch to.
   */
  setMode(mode) {
    if (this.mappings[mode]) {
      this.currentMode = mode;
    } else {
      console.warn(`Input mode "${mode}" not found, staying in "${this.currentMode}"`);
    }
  }

  /**
   * Registers a hook for an action.
   * @param {string} action - The action name.
   * @param {function} callback - The callback function.
   */
  addActionHook(action, callback) {
    if (!this.hooks[action]) {
      this.hooks[action] = [];
    }
    this.hooks[action].push(callback);
  }

  /**
   * Removes a hook for an action.
   * @param {string} action - The action name.
   * @param {function} callback - The callback function to remove.
   */
  removeActionHook(action, callback) {
    if (this.hooks[action]) {
      const index = this.hooks[action].indexOf(callback);
      if (index > -1) {
        this.hooks[action].splice(index, 1);
      }
    }
  }

  /**
   * Updates the input state and triggers actions.
   * Call this in the game loop.
   */
  update() {
    const modeMappings = this.mappings[this.currentMode] || this.mappings['default'];
    const actions = { ...this.mappings['default'].actions, ...modeMappings.actions };


    // Update action states
    for (const action in actions) {
      const mapping = actions[action];
      let active = false;

      const checkKeyboard = (key) => {
        // Use isCodePressed for special keys like 'ArrowLeft', and isKeyPressed for others.
        if (key.length > 1) {
          return this.keyboard.isCodePressed(key);
        }
        return this.keyboard.isKeyPressed(key);
      };

      if (mapping.keyboard && checkKeyboard(mapping.keyboard)) {
        active = true;
      }
      if (mapping.gamepad && this.gamepad.keyPressed(mapping.gamepad)) {
        active = true;
      }
      if (mapping.mouse && this.mouse.isButtonPressed(mapping.mouse)) {
        active = true;
      }
      // TODO: Add touch checks

      const wasActive = this.actionStates[action];
      this.actionStates[action] = active;

      // Trigger hooks for single-press events (rising edge)
      if (active && !wasActive) {
        this.lastActionTime[action] = Date.now();
        if (this.hooks[action]) {
          this.hooks[action].forEach(hook => hook(action, this.currentMode));
        }
      }
    }
  }

  /**
   * Checks if an action is currently active.
   * @param {string} action - The action name.
   * @returns {boolean} True if the action is active.
   */
  isActionActive(action) {
    return !!this.actionStates[action];
  }

  /**
   * Gets the last pressed key or button for an action.
   * @param {string} action - The action name.
   * @returns {string|null} The input that triggered the action.
   */
  getActionInput(action) {
    const modeMappings = this.mappings[this.currentMode] || this.mappings['default'];
    const mapping = modeMappings.actions[action];
    if (!mapping) return null;

    if (mapping.keyboard && this.keyboard.isKeyPressed(mapping.keyboard)) {
      return 'keyboard:' + mapping.keyboard;
    }
    if (mapping.gamepad && this.gamepad.keyPressed(mapping.gamepad)) {
      return 'gamepad:' + mapping.gamepad;
    }
    if (mapping.mouse && this.mouse.isButtonPressed(mapping.mouse)) {
      return 'mouse:' + mapping.mouse;
    }
    // TODO: Mouse and touch
    return null;
  }

  /**
   * Gets the current mode.
   * @returns {string} The current mode.
   */
  getMode() {
    return this.currentMode;
  }
}
