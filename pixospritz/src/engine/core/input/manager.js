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

import Keyboard from './keyboard.js';
import Mouse from './mouse.js';
import { GamePad } from './gamepad/index.js';
import Touch from './touch.js';
import { ActionLoader, EventLoader } from '../../utils/loaders/index.js';
import { Vector } from '../../utils/math/vector.js';
import { Direction } from '../../utils/enums.js';

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
      this.touch = new Touch(engine);
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
      /** @type {Object.<string, boolean>} */
      this.actionPressed = {}; // True on the frame the action was first pressed
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
    this.touch.init();
    // Set default mappings
    this.setModeMappings('default', {
      actions: {
        move_up: { keyboard: 'w', gamepad: 'up', touch: 'swipe_up' },
        move_down: { keyboard: 's', gamepad: 'down', touch: 'swipe_down' },
        move_left: { keyboard: 'a', gamepad: 'left', touch: 'swipe_left' },
        move_right: { keyboard: 'd', gamepad: 'right', touch: 'swipe_right' },
        interact: { keyboard: 'k', gamepad: 'a', touch: 'tap' },
        select: { mouse: 'left', touch: 'tap' },
        select_right: { mouse: 'right' },
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
   * Registers a custom action hook for scripting.
   * @param {string} action - The action name.
   * @param {function} hook - The hook function to call when action is triggered.
   */
  registerActionHook(action, hook) {
    if (!this.hooks[action]) {
      this.hooks[action] = [];
    }
    this.hooks[action].push(hook);
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
      if (mapping.gamepad) {
        // Check for button presses
        if (this.gamepad.keyPressed(mapping.gamepad)) {
          active = true;
        }
        // Check for joystick axis with threshold for directions
        else if (mapping.gamepad === 'up' && this.gamepad.map['y-axis'] < -0.5) {
          active = true;
        } else if (mapping.gamepad === 'down' && this.gamepad.map['y-axis'] > 0.5) {
          active = true;
        } else if (mapping.gamepad === 'left' && this.gamepad.map['x-axis'] < -0.5) {
          active = true;
        } else if (mapping.gamepad === 'right' && this.gamepad.map['x-axis'] > 0.5) {
          active = true;
        }
      }
      if (mapping.mouse && this.mouse.isButtonPressed(mapping.mouse)) {
        active = true;
      }
      if (mapping.touch && this.touch.isGestureActive(mapping.touch)) {
        active = true;
      }

      const wasActive = this.actionStates[action];
      this.actionStates[action] = active;
      this.actionPressed[action] = active && !wasActive;

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
   * Checks if an action was pressed this frame.
   * @param {string} action - The action name.
   * @returns {boolean} True if the action was pressed this frame.
   */
  isActionPressed(action) {
    return !!this.actionPressed[action];
  }

  /**
   * Sets the current input mode and notifies the mode manager.
   * @param {string} mode - The mode to switch to.
   */
  setMode(mode) {
    if (this.mappings[mode] || mode === 'default') {
      this.currentMode = mode;
      // Notify engine to update mode manager
      if (this.engine && this.engine.modeManager) {
        this.engine.modeManager.set(mode);
      }
    } else {
      console.warn(`Input mode "${mode}" not found, staying in "${this.currentMode}"`);
    }
  }

  /**
   * Handles input for the current mode.
   * @param {number} time - The current time.
   * @returns {boolean} True if input was handled by the mode, false otherwise.
   */
  handleInput(time) {
    if (!this.engine || !this.engine.modeManager) return false;
    return this.engine.modeManager.handleInput(time);
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
    if (mapping.gamepad) {
      if (this.gamepad.keyPressed(mapping.gamepad)) {
        return 'gamepad:' + mapping.gamepad;
      }
      // Check for joystick axis with threshold for directions
      if (mapping.gamepad === 'up' && this.gamepad.map['y-axis'] < -0.5) {
        return 'gamepad:up';
      } else if (mapping.gamepad === 'down' && this.gamepad.map['y-axis'] > 0.5) {
        return 'gamepad:down';
      } else if (mapping.gamepad === 'left' && this.gamepad.map['x-axis'] < -0.5) {
        return 'gamepad:left';
      } else if (mapping.gamepad === 'right' && this.gamepad.map['x-axis'] > 0.5) {
        return 'gamepad:right';
      }
    }
    if (mapping.mouse && this.mouse.isButtonPressed(mapping.mouse)) {
      return 'mouse:' + mapping.mouse;
    }
    if (mapping.touch && this.touch.isGestureActive(mapping.touch)) {
      return 'touch:' + mapping.touch;
    }
    return null;
  }

  /**
   * Gets the current mode.
   * @returns {string} The current mode.
   */
  getMode() {
    return this.currentMode;
  }

  /**
   * Gets the appropriate action for the avatar based on current input and mode mappings.
   * @param {Avatar} avatar - The avatar to get action for.
   * @returns {ActionLoader|null} Action to perform or null.
   */
  getAvatarAction(avatar) {
    const modeMappings = this.mappings[this.currentMode] || this.mappings['default'];
    const actions = { ...this.mappings['default'].actions, ...modeMappings.actions };

    // Check for other actions based on mappings
    for (const action in actions) {
      if (this.isActionActive(action)) {
        // Map action names to avatar methods
        switch (action) {
          case 'menu':
            // todo -- need to find a way to pass in params with actions
            return avatar.openMenu(
              {
                main: {
                  text: 'Close Menu',
                  x: 100,
                  y: 100,
                  w: 150,
                  h: 75,
                  colours: {
                    top: '#333',
                    bottom: '#777',
                    background: '#999',
                  },
                  trigger: (menu) => {
                    menu.completed = true;
                  },
                },
              },
              ['main']
            );
          case 'chat':
            return new ActionLoader(this.engine, 'chat', ['>:', true, { autoclose: false }], avatar);
          case 'dance':
            return new ActionLoader(this.engine, 'dance', [300, avatar.zone], avatar);
          case 'patrol':
            return new ActionLoader(this.engine, 'patrol', [avatar.pos.toArray(), new Vector(8, 13, avatar.pos.z).toArray(), 600, avatar.zone], avatar);
          case 'run':
            return new ActionLoader(this.engine, 'patrol', [avatar.pos.toArray(), new Vector(8, 13, avatar.pos.z).toArray(), 200, avatar.zone], avatar);
          case 'interact':
            return new ActionLoader(this.engine, 'interact', [avatar.pos.toArray(), avatar.facing, avatar.zone.world], avatar);
          case 'help':
            return new ActionLoader(this.engine, 'dialogue', ['Welcome! You pressed help! Press Escape to close', false, { autoclose: true }], avatar);
          case 'clear_speech':
            return avatar.speech.clearHud();
          case 'move_up':
            return avatar.handleWalk('w', {});
          case 'move_down':
            return avatar.handleWalk('s', {});
          case 'move_left':
            return avatar.handleWalk('a', {});
          case 'move_right':
            return avatar.handleWalk('d', {});
          case 'face_up':
            return avatar.faceDir(0); // Assuming Direction.Up = 0
          case 'face_down':
            return avatar.faceDir(2); // Assuming Direction.Down = 2
          case 'face_left':
            return avatar.faceDir(3); // Assuming Direction.Left = 3
          case 'face_right':
            return avatar.faceDir(1); // Assuming Direction.Right = 1
          default:
            // For custom actions, try to create ActionLoader with action name
            // Skip actions that don't have corresponding action files
            if (action.startsWith('camera_')) {
              // Handle camera actions directly using legacy camera logic
              const from = this.engine.renderManager.camera.cameraVector;
              let to = this.engine.renderManager.camera.cameraVector;
              switch (action) {
                case 'camera_rotate_left':
                  to = from.sub(new Vector(0, 0, 1));
                  to.z = Math.round(to.z % 9);
                  if (to.z === 0 && from.z === 8) {
                    from.z = 0;
                  }
                  if (to.z === 0 && from.z === 7) {
                    to.z = 8;
                  }
                  avatar.faceDir(Direction.adjustCameraDirection(to));
                  avatar.zone.world.addEvent(
                    new EventLoader(this.engine, 'camera', ['pan', { from, to, duration: 1 }], avatar.zone.world)
                  );
                  break;
                case 'camera_rotate_right':
                  to = from.add(new Vector(0, 0, 1));
                  to.z = Math.round(to.z % 9 ?? 8);
                  if (to.z === 0 && from.z === 8) {
                    from.z = 0;
                  }
                  if (to.z === 0 && from.z === 7) {
                    to.z = 8;
                  }
                  avatar.zone.world.addEvent(
                    new EventLoader(this.engine, 'camera', ['pan', { from, to, duration: 1 }], avatar.zone.world)
                  );
                  break;
                case 'camera_zoom_in':
                  // Camera zoom in logic
                  break;
                case 'camera_zoom_out':
                  // Camera zoom out logic
                  break;
                case 'camera_pan_left':
                  // Camera pan left logic
                  break;
                case 'camera_pan_right':
                  // Camera pan right logic
                  break;
                case 'camera_pan_up':
                  // Camera pan up logic
                  break;
                case 'camera_pan_down':
                  // Camera pan down logic
                  break;
                case 'camera_bind':
                  // Camera binds to avatar
                  avatar.bindCamera = true;
                  break;
                case 'camera_unbind':
                  // Camera unbinds from avatar
                  avatar.bindCamera = false;
                  break;
              }
              return null; // Don't create action for camera controls
            }
            return new ActionLoader(this.engine, action, [], avatar);
        }
      }
    }

    return null;
  }

  /**
   * Binds a key or input to an action for the current mode.
   * @param {string} action - The action name.
   * @param {string} inputType - The input type ('keyboard', 'mouse', 'gamepad').
   * @param {string} inputValue - The input value (key name, button, etc.).
   */
  bindAction(action, inputType, inputValue) {
    if (!this.mappings[this.currentMode]) {
      this.mappings[this.currentMode] = { actions: {} };
    }
    if (!this.mappings[this.currentMode].actions[action]) {
      this.mappings[this.currentMode].actions[action] = {};
    }
    this.mappings[this.currentMode].actions[action][inputType] = inputValue;
  }

  /**
   * Unbinds an action for the current mode.
   * @param {string} action - The action name.
   * @param {string} inputType - The input type to unbind.
   */
  unbindAction(action, inputType) {
    if (this.mappings[this.currentMode] && this.mappings[this.currentMode].actions[action]) {
      delete this.mappings[this.currentMode].actions[action][inputType];
    }
  }
}
