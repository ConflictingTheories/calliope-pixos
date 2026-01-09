"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _index = _interopRequireDefault(require("../utils/index.js"));
var _index2 = _interopRequireDefault(require("./database/index.js"));
var _index3 = _interopRequireDefault(require("./store/index.js"));
var _index4 = _interopRequireDefault(require("./hud/index.js"));
var _manager = _interopRequireDefault(require("./render/manager.js"));
var _manager2 = _interopRequireDefault(require("./resource/manager.js"));
var _manager3 = _interopRequireDefault(require("./cutscene/manager.js"));
var _manager4 = _interopRequireDefault(require("./mode/manager.js"));
var _manager5 = _interopRequireDefault(require("./input/manager.js"));
var _manager6 = _interopRequireDefault(require("./net/manager.js"));
var _index5 = require("./state/index.js");
var _index6 = require("./input/gamepad/index.js");
var _index7 = require("./debug/index.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
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
\\*                                                 */
/**
 * @typedef {object} SpritzGame
 * @property {function(GLEngine): Promise<void>} init - Initializes the game.
 * @property {function(GLEngine, number): void} render - Renders the game scene.
 * @property {function(number): void} update - Updates the game state.
 * @property {import('./scene/world.js').default} world - The game world instance.
 * @property {object} shaders - Shader programs for the game.
 * @property {object} effects - Visual effects for the game.
 * @property {boolean} loaded - Indicates if the game resources are loaded.
 * @property {object} [manifest] - Game manifest with network settings.
 */
/**
 * Core Pixos Graphics & Game Engine.
 * Orchestrates the main game loop, rendering, input handling, and resource management.
 */
var GLEngine = exports["default"] = /*#__PURE__*/function () {
  /**
   * Creates an instance of GLEngine.
   * @param {HTMLCanvasElement} canvas - The main WebGL canvas.
   * @param {HTMLCanvasElement} hudCanvas - The 2D canvas for HUD elements.
   * @param {HTMLCanvasElement} mipmap - The canvas for mipmap generation (or similar utility).
   * @param {HTMLCanvasElement} gamepadCanvas - The 2D canvas for mobile gamepad controls.
   * @param {HTMLInputElement} fileUpload - The file input element for resource loading.
   * @param {number} width - The desired width of the game viewport.
   * @param {number} height - The desired height of the game viewport.
   */
  function GLEngine(canvas, hudCanvas, mipmap, gamepadCanvas, fileUpload, width, height) {
    _classCallCheck(this, GLEngine);
    /** @type {HTMLCanvasElement} */
    this.canvas = canvas;
    /** @type {HTMLCanvasElement} */
    this.hudCanvas = hudCanvas;
    /** @type {HTMLCanvasElement} */
    this.gamepadCanvas = gamepadCanvas;
    /** @type {HTMLCanvasElement} */
    this.mipmap = mipmap;

    /** @type {HTMLInputElement} */
    this.fileUpload = fileUpload;

    /** @type {number} */
    this.width = width;
    /** @type {number} */
    this.height = height;

    /** @type {object} */
    this.utils = _index["default"];

    /** @type {NetworkManager} */
    this.networkManager = new _manager6["default"](this);

    /** @type {ResourceManager} */
    this.resourceManager = new _manager2["default"](this);

    /** @type {RenderManager} */
    this.renderManager = new _manager["default"](this);

    /** @type {Hud} */
    this.hud = new _index4["default"](this);

    /** @type {InputManager} */
    this.inputManager = new _manager5["default"](this); // Initialize InputManager

    /** @type {SpeechSynthesisUtterance} */
    this.voice = new SpeechSynthesisUtterance();

    /** @type {Database} */
    this.database = new _index2["default"]();

    /** @type {Store} */
    this.store = new _index3["default"]();

    /** @type {CutsceneManager} */
    this.cutsceneManager = new _manager3["default"](this);

    /** @type {ModeManager} */
    this.modeManager = new _manager4["default"](this); // Initialize ModeManager

    /** @type {StateManager} */
    this.stateManager = new _index5.StateManager(this); // Initialize StateManager for save/load

    // Debug flags
    /** @type {boolean} */
    this.debug = false; // General debug mode (enables console logs)
    /** @type {boolean} */
    this.debugHeightOverlay = false; // Height debug overlay (shows z values on screen)

    // Game Loop
    /** @type {boolean} */
    this.running = false;

    /** @type {WebGL2RenderingContext|null} */
    this.gl = null;
    /** @type {CanvasRenderingContext2D|null} */
    this.ctx = null;
    /** @type {CanvasRenderingContext2D|null} */
    this.gp = null;
    /** @type {number} */
    this.frameCount = 0;
    /** @type {SpritzGame|null} */
    this.spritz = null;
    /** @type {boolean} */
    this.fullscreen = false;
    /** @type {number} */
    this.time = 0;
    /** @type {number|null} */
    this.requestId = null; // For requestAnimationFrame

    // Bind methods to the instance
    this.screenSize = this.screenSize.bind(this);
    this.render = this.render.bind(this);
    this.init = this.init.bind(this);
    this.close = this.close.bind(this);
  }

  /**
   * Initializes the game engine and the Spritz game instance.
   * @param {SpritzGame} spritz - The Spritz game object to initialize.
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   * @throws {Error} If WebGL, HUD canvas, or Gamepad canvas cannot be initialized.
   */
  return _createClass(GLEngine, [{
    key: "init",
    value: (function () {
      var _init = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(spritz) {
        var _spritz$manifest, _spritz$manifest2, _spritz$manifest3, _spritz$manifest4, _spritz$manifest5, _spritz$manifest6;
        var canvasStyle, ctx, gl, gp;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              if (!(this.canvas.clientWidth === 0 || this.canvas.clientHeight === 0)) {
                _context.n = 1;
                break;
              }
              console.warn('Canvas has invalid dimensions, waiting for layout...', {
                width: this.canvas.clientWidth,
                height: this.canvas.clientHeight
              });
              // Give browser time to layout
              _context.n = 1;
              return new Promise(function (resolve) {
                return setTimeout(resolve, 50);
              });
            case 1:
              // Re-check canvas visibility immediately before context creation
              canvasStyle = window.getComputedStyle(this.canvas);
              if (!(canvasStyle.display === 'none' || canvasStyle.visibility === 'hidden')) {
                _context.n = 2;
                break;
              }
              throw new Error('Canvas is hidden and cannot receive WebGL context');
            case 2:
              if (!(this.canvas.clientWidth <= 0 || this.canvas.clientHeight <= 0)) {
                _context.n = 3;
                break;
              }
              throw new Error('Canvas has zero dimensions and cannot receive WebGL context');
            case 3:
              /** @type {CanvasRenderingContext2D|null} */
              ctx = this.hudCanvas.getContext('2d');
              /** @type {WebGL2RenderingContext|null} */
              gl = this.canvas.getContext('webgl2', {
                antialias: true,
                depth: true,
                preserveDrawingBuffer: false
              });
              /** @type {CanvasRenderingContext2D|null} */
              gp = this.gamepadCanvas.getContext('2d');
              if (gl) {
                _context.n = 4;
                break;
              }
              console.error('WebGL context creation failed. Canvas element:', this.canvas);
              console.error('Canvas dimensions:', {
                clientWidth: this.canvas.clientWidth,
                clientHeight: this.canvas.clientHeight,
                width: this.canvas.width,
                height: this.canvas.height
              });
              throw new Error('WebGL: unable to initialize - context is null. Check canvas element visibility and size.');
            case 4:
              if (ctx) {
                _context.n = 5;
                break;
              }
              console.error('HUD context creation failed. Canvas element:', this.hudCanvas);
              throw new Error('Canvas: unable to initialize HUD - 2D context is null.');
            case 5:
              if (gp) {
                _context.n = 6;
                break;
              }
              console.error('Gamepad context creation failed. Canvas element:', this.gamepadCanvas);
              throw new Error('Gamepad: unable to initialize Mobile Canvas - 2D context is null.');
            case 6:
              // Make HUD same size as canvas
              ctx.canvas.width = gl.canvas.clientWidth;
              ctx.canvas.height = gl.canvas.clientHeight;

              /** @type {WebGL2RenderingContext} */
              this.gl = gl;
              /** @type {CanvasRenderingContext2D} */
              this.ctx = ctx;
              /** @type {CanvasRenderingContext2D} */
              this.gp = gp;
              this.frameCount = 0;
              this.spritz = spritz;
              this.fullscreen = false;

              // Initial time
              this.time = new Date().getTime();

              // Init Input Manager
              this.inputManager.init();

              // Initialize HUD
              this.hud.init();

              // Initialize render manager
              this.renderManager.init();

              // Configure Gamepad & touch - now handled through InputManager
              // Direct access deprecated, use inputManager instead
              /** @deprecated Use inputManager.gamepad instead. */
              this.gamepad = this.inputManager.gamepad;
              /** @deprecated Use inputManager.keyboard instead. */
              this.keyboard = this.inputManager.keyboard;
              /** @deprecated Use inputManager.mouse instead. */
              this.mouse = this.inputManager.mouse;
              /** @deprecated Use inputManager.touch instead. */
              this.touch = this.inputManager.touch;

              /** @deprecated Eventually move this into inputManager.touch instead. */
              this.touchHandler = this.gamepad.listen.bind(this.gamepad);

              // Initialize network if enabled
              if (!((_spritz$manifest = spritz.manifest) !== null && _spritz$manifest !== void 0 && (_spritz$manifest = _spritz$manifest.network) !== null && _spritz$manifest !== void 0 && _spritz$manifest.enabled)) {
                _context.n = 8;
                break;
              }
              _context.n = 7;
              return this.networkManager.connect(spritz.manifest.network.url);
            case 7:
              if (spritz.manifest.network.authority) {
                this.networkManager.setAuthority(spritz.manifest.network.authority);
              }
            case 8:
              _context.n = 9;
              return this.stateManager.init({
                gameId: ((_spritz$manifest2 = spritz.manifest) === null || _spritz$manifest2 === void 0 ? void 0 : _spritz$manifest2.id) || ((_spritz$manifest3 = spritz.manifest) === null || _spritz$manifest3 === void 0 ? void 0 : _spritz$manifest3.title) || 'unknown',
                gameVersion: ((_spritz$manifest4 = spritz.manifest) === null || _spritz$manifest4 === void 0 ? void 0 : _spritz$manifest4.version) || '1.0.0',
                autosaveInterval: (_spritz$manifest5 = spritz.manifest) !== null && _spritz$manifest5 !== void 0 && (_spritz$manifest5 = _spritz$manifest5.saveConfig) !== null && _spritz$manifest5 !== void 0 && _spritz$manifest5.autosaveInterval ? spritz.manifest.saveConfig.autosaveInterval * 1000 : 5 * 60 * 1000,
                maxCheckpoints: 5
              });
            case 9:
              // Start autosave if enabled
              if (((_spritz$manifest6 = spritz.manifest) === null || _spritz$manifest6 === void 0 || (_spritz$manifest6 = _spritz$manifest6.saveConfig) === null || _spritz$manifest6 === void 0 ? void 0 : _spritz$manifest6.autosave) !== false) {
                this.stateManager.startAutosave();
              }

              // Initialize Spritz game
              _context.n = 10;
              return spritz.init(this);
            case 10:
              // Create and configure debug overlays. These overlays display
              // performance information such as FPS and draw counts (toggled by F3)
              // and flag information (toggled by F4). They are appended to the document body
              // once the engine has been initialized and the DOM is available. The overlays
              // remain hidden until toggled.
              (0, _index7.attachWebglDebugInfo)(this);
              (0, _index7.attachFlagDebugInfo)(this);
            case 11:
              return _context.a(2);
          }
        }, _callee, this);
      }));
      function init(_x) {
        return _init.apply(this, arguments);
      }
      return init;
    }()
    /**
     * The main render loop for the game engine.
     * Called continuously via `requestAnimationFrame` to update and draw the game.
     * Handles debug counters, clears canvases, updates game state, renders the scene, and manages transitions.
     */
    )
  }, {
    key: "render",
    value: function render() {
      this.frameCount++;
      // Reset debug counters at the start of each frame so that metrics
      // reflect only the current frame's draw calls.
      if (this.renderManager && this.renderManager.resetDebugCounters) {
        this.renderManager.resetDebugCounters();
      }

      // Clear canvases
      this.hud.clearHud();
      // Draw active mode label (if any)
      if (this.hud.drawModeLabel) this.hud.drawModeLabel();
      this.renderManager.clearScreen();
      var timestamp = new Date().getTime();

      // Update Input Manager
      this.inputManager.update();

      // Object picking pass (for selection) - only if mode has picker enabled
      if (this.modeManager.hasPicker()) {
        // Enable picker shader (Todo - Improve performance - make it only 1x1 pixel framebuffer - and avoid needing to reclear screen).
        this.renderManager.activatePickerShaderProgram(false);
        this.spritz.render(this, timestamp); // Render scene for picking pass
        // Read pixel data immediately after picking render, before clearing screen
        this.getSelectedObject('sprite|object|tile', false);
      }

      // Update and render based on the active game mode
      if (!this.inputManager.handleInput(timestamp)) {
        // If mode doesn't handle input, do default update
        this.spritz.update(timestamp);
      }

      // Sync input mode with game mode
      var currentMode = this.modeManager.getMode();
      if (currentMode && this.inputManager.getMode() !== currentMode) {
        this.inputManager.setMode(currentMode);
      }

      // Core render loop (actually render scene to screen)
      var gl = this.renderManager.engine.gl;
      this.renderManager.clearScreen();
      // Draw skybox first, with depth writes disabled
      gl.depthMask(false);
      this.renderManager.renderSkybox();
      gl.depthMask(true);
      // Now draw world tiles/objects, then sprites
      this.renderManager.activateShaderProgram();
      this.modeManager.update(timestamp); // Update active mode

      // Allow particle system to update physics with a stable timestamp
      if (this.renderManager && this.renderManager.updateParticles) {
        try {
          this.renderManager.updateParticles(timestamp);
        } catch (e) {
          console.warn('updateParticles failed', e);
        }
      }
      this.spritz.render(this); // Render scene (might be overridden by mode)

      this.cutsceneManager.update(); // Update cutscene (if applicable)
      this.renderManager.updateTransition(); // Update transitions

      // Render particles after main scene but before HUD/gamepad
      if (this.renderManager && this.renderManager.renderParticles) {
        try {
          this.renderManager.renderParticles();
        } catch (e) {
          console.warn('renderParticles failed', e);
        }
      }
      this.gamepad.render(); // Render gamepad (may be optimizable?)

      // Draw height debug overlay if enabled (shows tile/sprite/object z values on screen)
      if (this.debugHeightOverlay && this.hud.drawHeightDebugOverlay) {
        try {
          this.hud.drawHeightDebugOverlay();
        } catch (e) {
          console.warn('drawHeightDebugOverlay failed', e);
        }
      }

      // Update debug overlay if enabled
      (0, _index7.updateDebugInformation)(this);
      this.requestId = requestAnimationFrame(this.render);
    }

    /**
     * Stops the main render loop and cleans up singletons.
     */
  }, {
    key: "close",
    value: function close() {
      if (this.requestId) {
        cancelAnimationFrame(this.requestId);
        this.requestId = null;
      }
      // Clear singletons to allow proper re-initialization on remount
      if (_index6.GamePad._instance === this.gamepad) {
        _index6.GamePad._instance = null;
      }
      if (_manager2["default"]._instance === this.resourceManager) {
        _manager2["default"]._instance = null;
      }
    }

    /**
     * Detects and returns the selected object on screen based on mouse/touch input.
     * Uses a color-picking technique where objects are rendered with unique IDs to an off-screen buffer,
     * and the pixel under the cursor is read to identify the object.
     * @param {'sprite'|'object'|'tile'|string} [type='sprite|object|tile'] - The type(s) of objects to consider for selection, pipe-separated.
     * @param {boolean} [useFrustum=false] - Whether to use a 1x1 pixel frustum for picking (performance optimization).
     * @returns {number|null} The ID of the selected object, or null if no object is selected or freecam is active.
     */
  }, {
    key: "getSelectedObject",
    value: function getSelectedObject() {
      var _this$spritz$world,
        _this$spritz$world2,
        _this$spritz$world3,
        _this = this;
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'sprite|object|tile';
      var useFrustum = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      // When FreeCam is active, suppress picking to avoid interfering with camera controls
      if (this._freecamActive) return null;
      if (((_this$spritz$world = this.spritz.world) === null || _this$spritz$world === void 0 || (_this$spritz$world = _this$spritz$world.spriteList) === null || _this$spritz$world === void 0 ? void 0 : _this$spritz$world.length) <= 0 && ((_this$spritz$world2 = this.spritz.world) === null || _this$spritz$world2 === void 0 || (_this$spritz$world2 = _this$spritz$world2.objectList) === null || _this$spritz$world2 === void 0 ? void 0 : _this$spritz$world2.length) <= 0 && ((_this$spritz$world3 = this.spritz.world) === null || _this$spritz$world3 === void 0 || (_this$spritz$world3 = _this$spritz$world3.zoneList) === null || _this$spritz$world3 === void 0 ? void 0 : _this$spritz$world3.length) <= 0) {
        return null; // No pickable objects in the scene
      }
      var gl = this.gl;
      var data = new Uint8Array(4);
      var mouseX = this.gamepad.x || 0;
      var mouseY = this.gamepad.y || 0;
      var pixelX = useFrustum ? 0 : mouseX * gl.canvas.width / gl.canvas.clientWidth;
      var pixelY = useFrustum ? 0 : gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
      gl.readPixels(pixelX,
      // x
      pixelY,
      // y
      1,
      // width
      1,
      // height
      gl.RGBA,
      // format
      gl.UNSIGNED_BYTE,
      // type
      data); // typed array to hold result

      var id = data[0] + (data[1] << 8) + (data[2] << 16);

      // Only process selection if a left click occurred this frame
      if (!this.inputManager.isActionPressed('select')) {
        return id;
      }

      // Select type(s) based on request
      type.split('|').forEach(function (t) {
        switch (t) {
          case 'sprite':
            _this.spritz.world.spriteList = _this.spritz.world.spriteList.map(function (sprite) {
              if (sprite.objId === id) {
                sprite.isSelected = true;
                if (_this.spritz.world.spriteDict[sprite.id]) {
                  _this.spritz.world.spriteDict[sprite.id].isSelected = true;
                  // Allow mode to handle selection first
                  if (!_this.modeManager.handleSelect(sprite.zone, sprite, null, 'sprite')) {
                    // TODO: Add a new trigger method onSelect()
                    if (typeof _this.spritz.world.spriteDict[sprite.id].onSelect === 'function') {
                      _this.spritz.world.spriteDict[sprite.id].onSelect(sprite.zone, sprite);
                    }
                  }
                }
              } else {
                sprite.isSelected = false; // Deselect others
              }
              return sprite;
            });
            break;
          case 'object':
            _this.spritz.world.objectList = _this.spritz.world.objectList.map(function (obj) {
              if (obj.objId === id) {
                obj.isSelected = true;
                if (_this.spritz.world.objectDict[obj.id]) {
                  _this.spritz.world.objectDict[obj.id].isSelected = true;
                  // Allow mode to handle selection first
                  if (!_this.modeManager.handleSelect(obj.zone, obj, null, 'object')) {
                    // TODO: Add a new trigger method onSelect()
                    if (typeof _this.spritz.world.objectDict[obj.id].onSelect === 'function') {
                      _this.spritz.world.objectDict[obj.id].onSelect(obj.zone, obj);
                    }
                  }
                }
              } else {
                obj.isSelected = false; // Deselect others
              }
              return obj;
            });
            break;
          case 'tile':
            // Read in zone, tile, and cell data from pixel
            var zoneObjId = data[0];
            var row = data[1];
            var cell = data[2];

            // Search zones and find selected tile
            _this.spritz.world.zoneList.forEach(function (zone) {
              if (zone.objId === zoneObjId) {
                // Allow mode to handle selection first
                if (!_this.modeManager.handleSelect(zone, row, cell, 'tile')) {
                  if (typeof zone.onSelect === 'function') {
                    zone.onSelect(row, cell);
                  }
                }
              }
            });
            if (id !== 0) {
              // If a valid ID was picked (not background)
              console.log('TILE SELECTION:', {
                zoneObjId: zoneObjId,
                row: row,
                cell: cell,
                zones: _this.spritz.world.zoneList
              });
            }
            break;
        }
      });
      return id;
    }

    /**
     * Sets a greeting text.
     * @deprecated This method should be moved to a more appropriate class, e.g., `Hud` or a new `DialogueManager`.
     * @param {string} text - The greeting text to set.
     */
  }, {
    key: "setGreeting",
    value: function setGreeting(text) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Setting GREETING:', text);
      }
      // Assuming globalStore exists and is the correct place for this
      if (this.globalStore) {
        this.globalStore.greeting = text;
      } else {
        console.warn('globalStore is not available to set greeting.');
      }
    }

    /**
     * Converts text to speech using the Web Speech API.
     * @param {string} text - The text to speak.
     * @param {SpeechSynthesisVoice|null} [voice=null] - The voice to use. Defaults to the first available voice.
     * @param {string} [lang='en'] - The language of the speech.
     * @param {number|null} [rate=null] - The speed of the speech (0.1 to 10).
     * @param {number|null} [volume=null] - The volume of the speech (0 to 1).
     * @param {number|null} [pitch=null] - The pitch of the speech (0 to 2).
     */
  }, {
    key: "speechSynthesis",
    value: function speechSynthesis(text) {
      var _window$speechSynthes;
      var voice = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var lang = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'en';
      var rate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var volume = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
      var pitch = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
      /** @type {SpeechSynthesisUtterance} */
      var speech = this.voice;
      /** @type {SpeechSynthesisVoice[]} */
      var voices = (_window$speechSynthes = window.speechSynthesis.getVoices()) !== null && _window$speechSynthes !== void 0 ? _window$speechSynthes : [];
      // Set voice
      speech.voice = voice || voices[0];
      if (rate) speech.rate = rate;
      if (volume) speech.volume = volume;
      if (pitch) speech.pitch = pitch;
      speech.text = text;
      speech.lang = lang;
      // Speak
      window.speechSynthesis.speak(speech);
    }

    /**
     * Returns the current client width and height of the main canvas.
     * @returns {{width: number, height: number}} An object containing the width and height.
     */
  }, {
    key: "screenSize",
    value: function screenSize() {
      return {
        width: this.canvas.clientWidth,
        height: this.canvas.clientHeight
      };
    }

    /**
     * Handles canvas resize events. Updates internal dimensions and notifies
     * relevant subsystems (HUD, RenderManager, Gamepad) of the size change.
     * This should be called when the canvas container is resized.
     */
  }, {
    key: "handleResize",
    value: function handleResize() {
      if (!this.gl || !this.ctx) return;
      var displayWidth = this.canvas.clientWidth;
      var displayHeight = this.canvas.clientHeight;

      // Check if the canvas needs resizing
      if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
        // Update canvas internal dimensions to match display size
        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;

        // Update HUD canvas
        if (this.hudCanvas) {
          this.hudCanvas.width = displayWidth;
          this.hudCanvas.height = displayHeight;
        }

        // Update engine width/height
        this.width = displayWidth;
        this.height = displayHeight;

        // Update WebGL viewport
        this.gl.viewport(0, 0, displayWidth, displayHeight);

        // Update render manager if available
        if (this.renderManager && this.renderManager.handleResize) {
          this.renderManager.handleResize(displayWidth, displayHeight);
        }

        // Update gamepad/input manager if available
        if (this.inputManager && this.inputManager.gamepad) {
          this.inputManager.gamepad.resize();
        }

        // Update HUD
        if (this.hud && this.hud.handleResize) {
          this.hud.handleResize(displayWidth, displayHeight);
        }
      }
    }
  }]);
}();