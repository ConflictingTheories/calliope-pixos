"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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
 * @fileoverview Pixos Cutscene Manager
 *
 * This minimal manager supports registering named cutscenes composed of
 * sequential steps (wait, transition, load zone). A cutscene can be
 * started via the engine API or Lua and will run asynchronously,
 * blocking player input until complete. Additional step types can be
 * added as needed.
 */
/**
 * @typedef {object} CutsceneStep
 * @property {string} type - The type of step ('wait', 'transition', 'load_zone', 'action', 'set_backdrop', 'show_cutout').
 * @property {number} [ms] - Milliseconds to wait (for 'wait' type).
 * @property {string} [effect] - Transition effect (for 'transition' and 'load_zone' types).
 * @property {string} [direction] - Transition direction ('in' or 'out', for 'transition' type).
 * @property {number} [duration] - Transition duration in ms (for 'transition' and 'load_zone' types).
 * @property {string} [zone] - Zone name to load (for 'load_zone' type).
 * @property {boolean} [remotely] - Whether to load remotely (for 'load_zone' type).
 * @property {string} [zip] - Zip archive for zone loading (for 'load_zone' type).
 * @property {function(): Promise<void>} [action] - Action function to run (for 'action' type).
 * @property {string} [backdrop] - Backdrop label to set (for 'set_backdrop' type).
 * @property {string} [sprite] - Sprite ID for cutout (for 'show_cutout' type).
 * @property {string} [cutout] - Cutout label (for 'show_cutout' type).
 * @property {string} [position] - Position ('left' or 'right') for cutout (for 'show_cutout' type).
 */
/**
 * CutsceneManager - Manages cutscenes in the Pixos game engine.
 * Supports registering and playing sequential cutscene steps asynchronously.
 */
var CutsceneManager = exports["default"] = /*#__PURE__*/_createClass(
/**
 * Creates an instance of CutsceneManager.
 * @param {import('../index.js').default} engine - The main game engine instance.
 */
function CutsceneManager(engine) {
  var _this = this;
  _classCallCheck(this, CutsceneManager);
  /**
   * Registers a cutscene definition.
   * @param {string} name - The name of the cutscene.
   * @param {CutsceneStep[]} steps - The array of cutscene steps.
   */
  _defineProperty(this, "register", function (name, steps) {
    _this.scenes[name] = Array.isArray(steps) ? steps.slice() : [];
  });
  /**
   * Checks if a cutscene is registered.
   * @param {string} name - The name of the cutscene.
   * @returns {boolean} True if the cutscene is registered.
   */
  _defineProperty(this, "isRegistered", function (name) {
    return name in _this.scenes;
  });
  /**
   * Starts playing a cutscene by name.
   * @param {string} name - The name of the cutscene to start.
   */
  _defineProperty(this, "start", function (name) {
    var def = _this.scenes[name];
    if (!def) {
      console.warn('Cutscene not found:', name);
      return;
    }
    _this.queue = def.slice();
    _this.active = true;
    _this._currentPromise = null;
    _this.currentBackdrop = null; // Reset backdrop
    _this.currentCutouts = []; // Reset cutouts
  });
  /**
   * Skips the active cutscene.
   */
  _defineProperty(this, "skip", function () {
    _this.queue = [];
    _this.active = false;
  });
  /**
   * Checks if a cutscene is running.
   * @returns {boolean} True if a cutscene is active.
   */
  _defineProperty(this, "isRunning", function () {
    return _this.active;
  });
  /**
   * Updates the cutscene manager each frame.
   */
  _defineProperty(this, "update", function () {
    if (!_this.active) return;
    // if a step is currently processing, wait
    if (_this._currentPromise) return;
    var step = _this.queue.shift();
    if (!step) {
      _this.active = false;
      return;
    }
    // execute step and on completion call update again to process next
    var promise;
    switch (step.type) {
      // todo -- add addiitonal step support:
      // -- Thinking along the lines of run script, dialogue, picker, music, sprite and object actions, etc.
      // -- in theory should be able to script a scene, set flags too, and have it proceed to the next scene if
      // -- if another one follows. -- I should be able to script a basic 'movie' using this
      case 'action':
        promise = _this.runAction(step);
        break;
      case 'wait':
        promise = _this.wait(step.ms || 0);
        break;
      case 'transition':
        promise = _this.transition(step);
        break;
      case 'load_zone':
        promise = _this.loadZone(step);
        break;
      case 'set_backdrop':
        promise = _this.setBackdrop(step);
        break;
      case 'show_cutout':
        promise = _this.showCutout(step);
        break;
      default:
        console.warn('Unknown cutscene step:', step.type);
        promise = Promise.resolve();
    }
    _this._currentPromise = promise;
    promise.then(function () {
      _this._currentPromise = null;
      _this.update();
    });
  });
  /**
   * Waits for a specified number of milliseconds.
   * @param {number} ms - The milliseconds to wait.
   * @returns {Promise<void>} A promise that resolves after the wait.
   */
  _defineProperty(this, "wait", function (ms) {
    return new Promise(function (resolve) {
      return setTimeout(resolve, ms);
    });
  });
  /**
   * Handles a transition step.
   * @param {CutsceneStep} step - The transition step.
   * @returns {Promise<void>} A promise that resolves when the transition completes.
   */
  _defineProperty(this, "transition", function (step) {
    var rm = _this.engine.renderManager;
    if (!rm) return Promise.resolve();
    var effect = step.effect || 'fade';
    var direction = step.direction || 'out';
    var duration = step.duration || 500;
    return rm.startTransition({
      effect: effect,
      direction: direction,
      duration: duration
    });
  });
  /**
   * Runs an action step.
   * @param {CutsceneStep} step - The action step.
   * @returns {Promise<void>} A promise that resolves when the action completes.
   */
  _defineProperty(this, "runAction", function (step) {
    var action = step.action;
    if (!action) return Promise.resolve();
    return action();
  });
  /**
   * Loads a zone as part of a cutscene.
   * @param {CutsceneStep} step - The load_zone step.
   * @returns {Promise<void>} A promise that resolves when the zone is loaded.
   */
  _defineProperty(this, "loadZone", function (step) {
    var zone = step.zone,
      _step$remotely = step.remotely,
      remotely = _step$remotely === void 0 ? false : _step$remotely,
      zip = step.zip;
    if (!zone || !_this.engine.spritz || !_this.engine.spritz.world) {
      return Promise.resolve();
    }
    var effect = step.effect || 'fade';
    var duration = step.duration || 500;
    if (zip) {
      return _this.engine.spritz.world.loadZoneFromZip(zone, zip, false, null);
    }
    return _this.engine.spritz.world.loadZone(zone, remotely, false, null);
  });
  /**
   * Sets the backdrop for the cutscene.
   * @param {CutsceneStep} step - The set_backdrop step.
   * @returns {Promise<void>} A promise that resolves when the backdrop is set.
   */
  _defineProperty(this, "setBackdrop", function (step) {
    _this.currentBackdrop = step.backdrop || null;
    return Promise.resolve();
  });
  /**
   * Shows a cutout in the cutscene.
   * @param {CutsceneStep} step - The show_cutout step.
   * @returns {Promise<void>} A promise that resolves when the cutout is shown.
   */
  _defineProperty(this, "showCutout", function (step) {
    var sprite = step.sprite,
      cutout = step.cutout,
      _step$position = step.position,
      position = _step$position === void 0 ? 'left' : _step$position;
    if (sprite && cutout) {
      // Remove existing cutout for this sprite if any
      _this.currentCutouts = _this.currentCutouts.filter(function (c) {
        return c.sprite !== sprite;
      });
      // Add new cutout
      _this.currentCutouts.push({
        sprite: sprite,
        cutout: cutout,
        position: position
      });
    }
    return Promise.resolve();
  });
  /** @type {import('../index.js').default} */
  this.engine = engine;
  /** @type {Object.<string, CutsceneStep[]>} */
  this.scenes = {}; // Registered cutscenes: name -> array of steps
  /** @type {CutsceneStep[]} */
  this.queue = []; // Queue of steps for the currently active cutscene
  /** @type {boolean} */
  this.active = false;
  /** @type {Promise<void>|null} */
  this._currentPromise = null;
  /** @type {string|null} */
  this.currentBackdrop = null; // Current backdrop label
  /** @type {Array} */
  this.currentCutouts = []; // Array of {sprite, cutout, position} objects
});