"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _keyboard = _interopRequireDefault(require("./keyboard.js"));
var _mouse = _interopRequireDefault(require("./mouse.js"));
var _index = require("./gamepad/index.js");
var _touch = _interopRequireDefault(require("./touch.js"));
var _index2 = require("../../utils/loaders/index.js");
var _vector = require("../../utils/math/vector.js");
var _enums = require("../../utils/enums.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*                                                 *\
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
var InputManager = exports["default"] = /*#__PURE__*/function () {
  /**
   * Creates an instance of InputManager.
   * @param {import('../index.js').default} engine - The main game engine instance.
   * @returns {InputManager} The singleton instance.
   */
  function InputManager(engine) {
    _classCallCheck(this, InputManager);
    if (!InputManager._instance) {
      /** @type {import('../index.js').default} */
      this.engine = engine;
      /** @type {Keyboard} */
      this.keyboard = new _keyboard["default"](engine);
      /** @type {Mouse} */
      this.mouse = new _mouse["default"](engine);
      /** @type {GamePad} */
      this.gamepad = new _index.GamePad(engine);
      this.touch = new _touch["default"](engine);
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
  return _createClass(InputManager, [{
    key: "init",
    value: function init() {
      this.keyboard.init();
      this.mouse.init();
      this.gamepad.init();
      this.touch.init();
      // Set default mappings
      this.setModeMappings('default', {
        actions: {
          move_up: {
            keyboard: 'w',
            gamepad: 'up',
            touch: 'swipe_up'
          },
          move_down: {
            keyboard: 's',
            gamepad: 'down',
            touch: 'swipe_down'
          },
          move_left: {
            keyboard: 'a',
            gamepad: 'left',
            touch: 'swipe_left'
          },
          move_right: {
            keyboard: 'd',
            gamepad: 'right',
            touch: 'swipe_right'
          },
          interact: {
            keyboard: 'k',
            gamepad: 'a',
            touch: 'tap'
          },
          select: {
            mouse: 'left',
            touch: 'tap'
          },
          select_right: {
            mouse: 'right'
          },
          camera_pan_left: {
            keyboard: 'ArrowLeft'
          },
          camera_pan_right: {
            keyboard: 'ArrowRight'
          },
          camera_pan_up: {
            keyboard: 'ArrowUp'
          },
          camera_pan_down: {
            keyboard: 'ArrowDown'
          },
          camera_zoom_in: {
            keyboard: 'q'
          },
          camera_zoom_out: {
            keyboard: 'e'
          },
          camera_rotate_left: {
            keyboard: 'z'
          },
          camera_rotate_right: {
            keyboard: 'x'
          },
          menu: {
            keyboard: 'm',
            gamepad: 'y'
          },
          run: {
            keyboard: 'r',
            gamepad: 'y'
          },
          bind_camera: {
            keyboard: 'b'
          },
          fixed_camera: {
            keyboard: 'c'
          },
          help: {
            keyboard: 'h'
          },
          chat: {
            keyboard: ' '
          },
          clear_speech: {
            keyboard: 'Escape'
          },
          patrol: {
            keyboard: 'p'
          },
          dance: {
            keyboard: 'u'
          },
          height_up: {
            keyboard: 'y'
          },
          height_down: {
            keyboard: 'f'
          }
        }
      });
    }

    /**
     * Sets action mappings for a specific mode.
     * @param {string} mode - The mode name.
     * @param {ModeMappings} mappings - The mappings for the mode.
     */
  }, {
    key: "setModeMappings",
    value: function setModeMappings(mode, mappings) {
      this.mappings[mode] = mappings;
    }

    /**
     * Registers a hook for an action.
     * @param {string} action - The action name.
     * @param {function} callback - The callback function.
     */
  }, {
    key: "addActionHook",
    value: function addActionHook(action, callback) {
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
  }, {
    key: "registerActionHook",
    value: function registerActionHook(action, hook) {
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
  }, {
    key: "removeActionHook",
    value: function removeActionHook(action, callback) {
      if (this.hooks[action]) {
        var index = this.hooks[action].indexOf(callback);
        if (index > -1) {
          this.hooks[action].splice(index, 1);
        }
      }
    }

    /**
     * Updates the input state and triggers actions.
     * Call this in the game loop.
     */
  }, {
    key: "update",
    value: function update() {
      var _this = this;
      var modeMappings = this.mappings[this.currentMode] || this.mappings['default'];
      var actions = _objectSpread(_objectSpread({}, this.mappings['default'].actions), modeMappings.actions);

      // Update action states
      var _loop = function _loop(action) {
        var mapping = actions[action];
        var active = false;
        var checkKeyboard = function checkKeyboard(key) {
          // Use isCodePressed for special keys like 'ArrowLeft', and isKeyPressed for others.
          if (key.length > 1) {
            return _this.keyboard.isCodePressed(key);
          }
          return _this.keyboard.isKeyPressed(key);
        };
        if (mapping.keyboard && checkKeyboard(mapping.keyboard)) {
          active = true;
        }
        if (mapping.gamepad) {
          // Check for button presses
          if (_this.gamepad.keyPressed(mapping.gamepad)) {
            active = true;
          }
          // Check for joystick axis with threshold for directions
          else if (mapping.gamepad === 'up' && _this.gamepad.map['y-axis'] < -0.5) {
            active = true;
          } else if (mapping.gamepad === 'down' && _this.gamepad.map['y-axis'] > 0.5) {
            active = true;
          } else if (mapping.gamepad === 'left' && _this.gamepad.map['x-axis'] < -0.5) {
            active = true;
          } else if (mapping.gamepad === 'right' && _this.gamepad.map['x-axis'] > 0.5) {
            active = true;
          }
        }
        if (mapping.mouse && _this.mouse.isButtonPressed(mapping.mouse)) {
          active = true;
        }
        if (mapping.touch && _this.touch.isGestureActive(mapping.touch)) {
          active = true;
        }
        var wasActive = _this.actionStates[action];
        _this.actionStates[action] = active;
        _this.actionPressed[action] = active && !wasActive;

        // Trigger hooks for single-press events (rising edge)
        if (active && !wasActive) {
          _this.lastActionTime[action] = Date.now();
          if (_this.hooks[action]) {
            _this.hooks[action].forEach(function (hook) {
              return hook(action, _this.currentMode);
            });
          }
        }
      };
      for (var action in actions) {
        _loop(action);
      }
    }

    /**
     * Checks if an action is currently active.
     * @param {string} action - The action name.
     * @returns {boolean} True if the action is active.
     */
  }, {
    key: "isActionActive",
    value: function isActionActive(action) {
      return !!this.actionStates[action];
    }

    /**
     * Checks if an action was pressed this frame.
     * @param {string} action - The action name.
     * @returns {boolean} True if the action was pressed this frame.
     */
  }, {
    key: "isActionPressed",
    value: function isActionPressed(action) {
      return !!this.actionPressed[action];
    }

    /**
     * Sets the current input mode and notifies the mode manager.
     * @param {string} mode - The mode to switch to.
     */
  }, {
    key: "setMode",
    value: function setMode(mode) {
      if (this.mappings[mode] || mode === 'default') {
        this.currentMode = mode;
        // Notify engine to update mode manager
        if (this.engine && this.engine.modeManager) {
          this.engine.modeManager.set(mode);
        }
      } else {
        console.warn("Input mode \"".concat(mode, "\" not found, staying in \"").concat(this.currentMode, "\""));
      }
    }

    /**
     * Handles input for the current mode.
     * @param {number} time - The current time.
     * @returns {boolean} True if input was handled by the mode, false otherwise.
     */
  }, {
    key: "handleInput",
    value: function handleInput(time) {
      if (!this.engine || !this.engine.modeManager) return false;
      return this.engine.modeManager.handleInput(time);
    }

    /**
     * Gets the last pressed key or button for an action.
     * @param {string} action - The action name.
     * @returns {string|null} The input that triggered the action.
     */
  }, {
    key: "getActionInput",
    value: function getActionInput(action) {
      var modeMappings = this.mappings[this.currentMode] || this.mappings['default'];
      var mapping = modeMappings.actions[action];
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
  }, {
    key: "getMode",
    value: function getMode() {
      return this.currentMode;
    }

    /**
     * Gets the appropriate action for the avatar based on current input and mode mappings.
     * @param {Avatar} avatar - The avatar to get action for.
     * @returns {ActionLoader|null} Action to perform or null.
     */
  }, {
    key: "getAvatarAction",
    value: function getAvatarAction(avatar) {
      var _ref;
      var modeMappings = this.mappings[this.currentMode] || this.mappings['default'];
      var actions = _objectSpread(_objectSpread({}, this.mappings['default'].actions), modeMappings.actions);

      // Check for other actions based on mappings
      for (var action in actions) {
        if (this.isActionActive(action)) {
          // Map action names to avatar methods
          switch (action) {
            case 'menu':
              // todo -- need to find a way to pass in params with actions
              return avatar.openMenu({
                main: {
                  text: 'Close Menu',
                  x: 100,
                  y: 100,
                  w: 150,
                  h: 75,
                  colours: {
                    top: '#333',
                    bottom: '#777',
                    background: '#999'
                  },
                  trigger: function trigger(menu) {
                    menu.completed = true;
                  }
                }
              }, ['main']);
            case 'chat':
              return new _index2.ActionLoader(this.engine, 'chat', ['>:', true, {
                autoclose: false
              }], avatar);
            case 'dance':
              return new _index2.ActionLoader(this.engine, 'dance', [300, avatar.zone], avatar);
            case 'patrol':
              return new _index2.ActionLoader(this.engine, 'patrol', [avatar.pos.toArray(), new _vector.Vector(8, 13, avatar.pos.z).toArray(), 600, avatar.zone], avatar);
            case 'run':
              return new _index2.ActionLoader(this.engine, 'patrol', [avatar.pos.toArray(), new _vector.Vector(8, 13, avatar.pos.z).toArray(), 200, avatar.zone], avatar);
            case 'interact':
              return new _index2.ActionLoader(this.engine, 'interact', [avatar.pos.toArray(), avatar.facing, avatar.zone.world], avatar);
            case 'help':
              return new _index2.ActionLoader(this.engine, 'dialogue', ['Welcome! You pressed help! Press Escape to close', false, {
                autoclose: true
              }], avatar);
            case 'clear_speech':
              return avatar.speech.clearHud();
            case 'move_up':
              // Get the direction the camera is facing and move forward relative to it
              var upDir = _enums.Direction.getCameraRelativeDirection('forward', this.engine.renderManager.camera.cameraDir);
              return avatar.handleWalk('w', {}, upDir);
            case 'move_down':
              // Move backward relative to camera
              var downDir = _enums.Direction.getCameraRelativeDirection('backward', this.engine.renderManager.camera.cameraDir);
              return avatar.handleWalk('s', {}, downDir);
            case 'move_left':
              // Move left relative to camera
              var leftDir = _enums.Direction.getCameraRelativeDirection('left', this.engine.renderManager.camera.cameraDir);
              return avatar.handleWalk('a', {}, leftDir);
            case 'move_right':
              // Move right relative to camera
              var rightDir = _enums.Direction.getCameraRelativeDirection('right', this.engine.renderManager.camera.cameraDir);
              return avatar.handleWalk('d', {}, rightDir);
            case 'face_up':
              return avatar.faceDir("N");
            // Assuming Direction.Up = 0
            case 'face_down':
              return avatar.faceDir("S");
            // Assuming Direction.Down = 2
            case 'face_left':
              return avatar.faceDir("W");
            // Assuming Direction.Left = 3
            case 'face_right':
              return avatar.faceDir("E");
            // Assuming Direction.Right = 1
            default:
              // For custom actions, try to create ActionLoader with action name
              // Skip actions that don't have corresponding action files
              if (action.startsWith('camera_')) {
                // Handle camera actions directly using legacy camera logic
                var from = this.engine.renderManager.camera.cameraVector;
                var to = this.engine.renderManager.camera.cameraVector;
                var facing = _enums.Direction.adjustCameraDirection(to);
                switch (action) {
                  case 'camera_rotate_left':
                    to = from.sub(new _vector.Vector(0, 0, 1));
                    to.z = Math.round(to.z % 9);
                    if (to.z === 0 && from.z === 8) {
                      from.z = 0;
                    }
                    if (to.z === 0 && from.z === 7) {
                      to.z = 8;
                    }
                    avatar.faceDir(_enums.Direction.spriteSequence(facing));
                    avatar.zone.world.addEvent(new _index2.EventLoader(this.engine, 'camera', ['pan', {
                      from: from,
                      to: to,
                      duration: 1
                    }], avatar.zone.world));
                    break;
                  case 'camera_rotate_right':
                    to = from.add(new _vector.Vector(0, 0, 1));
                    to.z = Math.round((_ref = to.z % 9) !== null && _ref !== void 0 ? _ref : 8);
                    if (to.z === 0 && from.z === 8) {
                      from.z = 0;
                    }
                    if (to.z === 0 && from.z === 7) {
                      to.z = 8;
                    }
                    avatar.faceDir(_enums.Direction.spriteSequence(facing));
                    avatar.zone.world.addEvent(new _index2.EventLoader(this.engine, 'camera', ['pan', {
                      from: from,
                      to: to,
                      duration: 1
                    }], avatar.zone.world));
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
              return new _index2.ActionLoader(this.engine, action, [], avatar);
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
  }, {
    key: "bindAction",
    value: function bindAction(action, inputType, inputValue) {
      if (!this.mappings[this.currentMode]) {
        this.mappings[this.currentMode] = {
          actions: {}
        };
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
  }, {
    key: "unbindAction",
    value: function unbindAction(action, inputType) {
      if (this.mappings[this.currentMode] && this.mappings[this.currentMode].actions[action]) {
        delete this.mappings[this.currentMode].actions[action][inputType];
      }
    }
  }]);
}();