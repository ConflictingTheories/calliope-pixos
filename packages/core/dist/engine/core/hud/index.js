"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.textScrollBox = exports.minecraftia = exports["default"] = void 0;
var _index = _interopRequireDefault(require("../index.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
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
var minecraftia = exports.minecraftia = new FontFace('minecraftia', 'url(/pixospritz/font/minecraftia.ttf)');

/**
 * Hud - Manages Heads-Up Display elements for the Pixos game engine.
 * Handles drawing buttons, text, mode labels, and scrolling textboxes.
 */
var Hud = exports["default"] = /*#__PURE__*/_createClass(
/**
 * Creates an instance of Hud.
 * @param {GLEngine} engine - The main game engine instance.
 * @returns {Hud} The singleton instance.
 */
function Hud(engine) {
  var _this = this;
  _classCallCheck(this, Hud);
  /**
   * Initializes the HUD context.
   */
  _defineProperty(this, "init", function () {
    // setup anything needed at the start (run once)
    /** @type {CanvasRenderingContext2D} */
    _this.ctx = _this.engine.ctx;
  });
  /**
   * Draws a button
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {*} colours
   */
  _defineProperty(this, "drawButton", function (text, x, y, w, h, colours) {
    var ctx = _this.ctx;

    // Apply HUD style
    _this.applyStyle({
      font: '20px invasion2000',
      textAlign: 'center',
      textBaseline: 'middle',
      fillStyle: colours.background,
      globalAlpha: 1.0
    });

    // Draw the button background
    ctx.fillStyle = colours.background;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();

    // Light gradient effect on top of the button
    var grad = ctx.createLinearGradient(x, y, x, y + h / 2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(x, y, w, h / 2);

    // Draw the button text
    ctx.fillStyle = colours.text;
    ctx.fillText(text, x + w / 2, y + h / 2);

    // Add hover effect
    ctx.beginPath();
    ctx.strokeStyle = '#fff';
    ctx.rect(x, y, w, h);
    ctx.stroke();
  });
  /**
   * Clears the HUD overlay.
   */
  _defineProperty(this, "clearHud", function () {
    _this.ctx.clearRect(0, 0, _this.engine.ctx.canvas.width, _this.engine.ctx.canvas.height);
  });
  /**
   * Handles canvas resize events. Updates internal references if needed.
   * @param {number} width - The new canvas width.
   * @param {number} height - The new canvas height.
   * @returns {void}
   */
  _defineProperty(this, "handleResize", function (width, height) {
    // HUD context is directly tied to the canvas, so it automatically
    // reflects the new dimensions. This hook is available for any
    // HUD-specific resize handling if needed in the future.
    // Re-acquire context reference in case it changed
    _this.ctx = _this.engine.ctx;
  });
  /**
   * Sets the backdrop image for cutscenes.
   * @param {Image|null} image - The backdrop image.
   */
  _defineProperty(this, "setBackdrop", function (image) {
    _this.backdropImage = image;
  });
  /**
   * Sets the cutout images for cutscenes.
   * @param {Array} cutouts - Array of {image, position} objects.
   */
  _defineProperty(this, "setCutouts", function (cutouts) {
    _this.cutoutImages = cutouts;
  });
  /**
   * Applies style configuration to the canvas context.
   * @param {Object} styleConfig - The style properties to apply.
   * @param {string} [styleConfig.font='20px invasion2000'] - Font style.
   * @param {string} [styleConfig.textAlign='center'] - Text alignment.
   * @param {string} [styleConfig.textBaseline='middle'] - Text baseline.
   * @param {string} [styleConfig.fillStyle='#ffffff'] - Fill color.
   * @param {number} [styleConfig.globalAlpha=1.0] - Global alpha.
   */
  _defineProperty(this, "applyStyle", function (styleConfig) {
    // Apply style to the context
    var defaultStyle = {
      font: '20px invasion2000',
      textAlign: 'center',
      textBaseline: 'middle',
      fillStyle: '#ffffff',
      globalAlpha: 1.0
    };
    Object.assign(_this.ctx, defaultStyle, styleConfig);
  });
  /**
   * Writes text to the HUD.
   * @param {string} text - The text to write.
   * @param {number} x - The x position.
   * @param {number} y - The y position.
   * @param {string|null} [src=null] - Optional image source for portrait.
   */
  _defineProperty(this, "writeText", function (text, x, y) {
    var src = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    // Apply style
    _this.applyStyle({
      font: '24px invasion2000',
      textAlign: 'center',
      textBaseline: 'middle',
      fillStyle: '#ffffff'
    });
    if (src) {
      // Draw portrait if set
      _this.ctx.drawImage(src, x !== null && x !== void 0 ? x : _this.ctx.canvas.clientWidth / 2, y !== null && y !== void 0 ? y : _this.ctx.canvas.clientHeight / 2, 76, 76);
      _this.ctx.fillText(text, x !== null && x !== void 0 ? x : _this.ctx.canvas.clientWidth / 2 + 80, y !== null && y !== void 0 ? y : _this.ctx.canvas.clientHeight / 2);
    } else {
      _this.ctx.fillText(text, x !== null && x !== void 0 ? x : _this.ctx.canvas.clientWidth / 2, y !== null && y !== void 0 ? y : _this.ctx.canvas.clientHeight / 2);
    }
  });
  /**
   * Draws the active mode name in the HUD (top-left).
   */
  _defineProperty(this, "drawModeLabel", function () {
    try {
      var _this$engine;
      var mode = (_this$engine = _this.engine) === null || _this$engine === void 0 || (_this$engine = _this$engine.spritz) === null || _this$engine === void 0 || (_this$engine = _this$engine.world) === null || _this$engine === void 0 || (_this$engine = _this$engine.modeManager) === null || _this$engine === void 0 ? void 0 : _this$engine.getMode();
      if (!mode) return;
      _this.applyStyle({
        font: '18px invasion2000',
        textAlign: 'left',
        textBaseline: 'top',
        fillStyle: '#ff0'
      });
      _this.ctx.fillText("MODE: ".concat(mode), 12, 12);
    } catch (e) {
      // ignore
    }
  });
  /**
   * Draws height debug overlay showing tile and sprite heights.
   * Call this after rendering the 3D scene to overlay debug info.
   */
  _defineProperty(this, "drawHeightDebugOverlay", function () {
    var _this$engine2;
    if (!((_this$engine2 = _this.engine) !== null && _this$engine2 !== void 0 && _this$engine2.debugHeightOverlay)) return;
    try {
      var _this$engine3, _this$engine4;
      var world = (_this$engine3 = _this.engine) === null || _this$engine3 === void 0 || (_this$engine3 = _this$engine3.spritz) === null || _this$engine3 === void 0 ? void 0 : _this$engine3.world;
      if (!world) return;
      var ctx = _this.ctx;
      var camera = (_this$engine4 = _this.engine) === null || _this$engine4 === void 0 || (_this$engine4 = _this$engine4.renderManager) === null || _this$engine4 === void 0 ? void 0 : _this$engine4.camera;
      if (!camera) return;

      // Helper to project world position to screen
      var projectToScreen = function projectToScreen(worldX, worldY, worldZ) {
        var gl = _this.engine.gl;
        var rm = _this.engine.renderManager;
        var modelMat = rm.uModelMat;
        var viewMat = camera.uViewMat;
        var projMat = rm.uProjMat;

        // Transform: world -> clip -> NDC -> screen
        var vec4 = [worldX, worldY, worldZ, 1.0];
        // model * vec
        var x = modelMat[0] * vec4[0] + modelMat[4] * vec4[1] + modelMat[8] * vec4[2] + modelMat[12];
        var y = modelMat[1] * vec4[0] + modelMat[5] * vec4[1] + modelMat[9] * vec4[2] + modelMat[13];
        var z = modelMat[2] * vec4[0] + modelMat[6] * vec4[1] + modelMat[10] * vec4[2] + modelMat[14];
        var w = modelMat[3] * vec4[0] + modelMat[7] * vec4[1] + modelMat[11] * vec4[2] + modelMat[15];
        // view * (model * vec)
        var vx = viewMat[0] * x + viewMat[4] * y + viewMat[8] * z + viewMat[12] * w;
        var vy = viewMat[1] * x + viewMat[5] * y + viewMat[9] * z + viewMat[13] * w;
        var vz = viewMat[2] * x + viewMat[6] * y + viewMat[10] * z + viewMat[14] * w;
        var vw = viewMat[3] * x + viewMat[7] * y + viewMat[11] * z + viewMat[15] * w;
        // proj * (view * model * vec)
        var px = projMat[0] * vx + projMat[4] * vy + projMat[8] * vz + projMat[12] * vw;
        var py = projMat[1] * vx + projMat[5] * vy + projMat[9] * vz + projMat[13] * vw;
        var pw = projMat[3] * vx + projMat[7] * vy + projMat[11] * vz + projMat[15] * vw;
        // NDC
        if (Math.abs(pw) < 0.0001) return null; // behind camera or at infinity
        var ndcX = px / pw;
        var ndcY = py / pw;
        // screen
        var screenX = (ndcX * 0.5 + 0.5) * gl.canvas.width;
        var screenY = (1.0 - (ndcY * 0.5 + 0.5)) * gl.canvas.height;
        return {
          x: screenX,
          y: screenY,
          behind: pw < 0
        };
      };
      _this.applyStyle({
        font: '12px monospace',
        textAlign: 'center',
        textBaseline: 'middle',
        fillStyle: '#0f0'
      });

      // Draw tile heights
      world.zoneList.forEach(function (zone) {
        var _zone$zoneData;
        if (!zone.loaded || !((_zone$zoneData = zone.zoneData) !== null && _zone$zoneData !== void 0 && _zone$zoneData.cells)) return;
        var cells = zone.zoneData.cells;
        for (var row = 0; row < cells.length; row++) {
          for (var col = 0; col < cells[row].length; col++) {
            try {
              var tileHeight = zone.getHeight(col + 0.5, row + 0.5);
              var screenPos = projectToScreen(col + 0.5, row + 0.5, tileHeight);
              if (screenPos && !screenPos.behind) {
                ctx.fillStyle = '#0ff';
                ctx.fillText("".concat(tileHeight.toFixed(2)), screenPos.x, screenPos.y);
              }
            } catch (e) {
              // ignore projection errors
            }
          }
        }
      });

      // Draw sprite heights
      _this.applyStyle({
        font: '14px monospace',
        textAlign: 'center',
        textBaseline: 'bottom',
        fillStyle: '#ff0'
      });
      world.spriteList.forEach(function (sprite) {
        if (!sprite.pos) return;
        try {
          var screenPos = projectToScreen(sprite.pos.x, sprite.pos.y, sprite.pos.z + 0.5);
          if (screenPos && !screenPos.behind) {
            ctx.fillStyle = '#ff0';
            ctx.fillText("".concat(sprite.id, ": z=").concat(sprite.pos.z.toFixed(2)), screenPos.x, screenPos.y);
          }
        } catch (e) {
          // ignore projection errors
        }
      });

      // Draw object heights
      _this.applyStyle({
        font: '14px monospace',
        textAlign: 'center',
        textBaseline: 'bottom',
        fillStyle: '#f0f'
      });
      world.objectList.forEach(function (obj) {
        if (!obj.pos) return;
        try {
          var screenPos = projectToScreen(obj.pos.x, obj.pos.y, obj.pos.z + 0.5);
          if (screenPos && !screenPos.behind) {
            ctx.fillStyle = '#f0f';
            ctx.fillText("".concat(obj.id, ": z=").concat(obj.pos.z.toFixed(2)), screenPos.x, screenPos.y);
          }
        } catch (e) {
          // ignore projection errors
        }
      });
    } catch (e) {
      console.warn('drawHeightDebugOverlay error:', e);
    }
  });
  /**
   * Draws the backdrop and cutouts for cutscenes.
   */
  _defineProperty(this, "drawCutsceneElements", function () {
    var ctx = _this.ctx;
    var canvasWidth = ctx.canvas.width;
    var canvasHeight = ctx.canvas.height;

    // Draw backdrop if set
    if (_this.backdropImage) {
      ctx.drawImage(_this.backdropImage, 0, 0, canvasWidth, canvasHeight);
    }

    // Draw cutouts
    _this.cutoutImages.forEach(function (_ref) {
      var image = _ref.image,
        position = _ref.position;
      if (image) {
        var x = position === 'left' ? 50 : canvasWidth - 250;
        var y = canvasHeight / 2 - 100;
        var width = 200;
        var height = 200;
        if (position === 'right') {
          // Mirror for right side
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(image, -x - width, y, width, height);
          ctx.restore();
        } else {
          ctx.drawImage(image, x, y, width, height);
        }
      }
    });
  });
  /**
   * Creates a scrolling textbox for dialogue.
   * @param {string} text - The text to display.
   * @param {boolean} [scrolling=false] - Whether to enable scrolling.
   * @param {Object} [options={}] - Additional options for the textbox.
   * @returns {textScrollBox} The created textbox instance.
   */
  _defineProperty(this, "scrollText", function (text) {
    var scrolling = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    // Draw cutscene elements first (backdrop and cutouts)
    _this.drawCutsceneElements();
    var txt = new textScrollBox(_this.engine.ctx);
    txt.init(text, 10, 2 * _this.engine.ctx.canvas.height / 3, _this.engine.ctx.canvas.width - 20, _this.engine.ctx.canvas.height / 3 - 20, options);
    txt.setOptions(options);
    if (scrolling) {
      txt.scroll((Math.sin(new Date().getTime() / 3000) + 1) * txt.maxScroll * 0.5); // default oscillate
    }
    txt.render();
    return txt;
  });
  if (!Hud._instance) {
    /** @type {GLEngine} */
    this.engine = engine;
    /** @type {Image|null} */
    this.backdropImage = null;
    /** @type {Array} */
    this.cutoutImages = []; // Array of {image, position} objects
    Hud._instance = this;
  }
  return Hud._instance;
});
/**
 * textScrollBox - A scrolling text box UI for dialogue.
 * Courtesy of https://stackoverflow.com/questions/44488996/create-a-scrollable-text-inside-canvas
 */
var textScrollBox = exports.textScrollBox = /*#__PURE__*/_createClass(
/**
 * Creates an instance of textScrollBox.
 * @param {CanvasRenderingContext2D} ctx - The canvas context.
 */
function textScrollBox(_ctx) {
  var _this2 = this;
  _classCallCheck(this, textScrollBox);
  /**
   * Initializes the textbox.
   * @param {string} text - The text to display.
   * @param {number} x - The x position.
   * @param {number} y - The y position.
   * @param {number} width - The width.
   * @param {number} height - The height.
   * @param {Object} [options={}] - Additional options.
   */
  _defineProperty(this, "init", function (text, x, y, width, height) {
    var _options$portrait;
    var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
    _this2.text = text;
    _this2.x = x;
    _this2.y = y;
    _this2.width = width;
    _this2.height = height;
    _this2.portrait = (_options$portrait = options.portrait) !== null && _options$portrait !== void 0 ? _options$portrait : null;
    _this2.setOptions(options);
    _this2.cleanit();
  });
  /**
   * Cleans and formats the text.
   * @param {boolean} [dontFitText=false] - Whether to skip fitting text.
   */
  _defineProperty(this, "cleanit", function (dontFitText) {
    if (_this2.dirty) {
      _this2.setFont();
      _this2.getTextPos();
      _this2.dirty = false;
      if (!dontFitText) {
        _this2.fitText();
      }
    }
  });
  /**
   * Applies options to the textbox.
   * @param {Object} options - The options to apply.
   */
  _defineProperty(this, "setOptions", function (options) {
    Object.keys(_this2).forEach(function (key) {
      if (options[key] !== undefined) {
        _this2[key] = options[key];
        _this2.dirty = true;
      }
    });
  });
  /**
   * Applies the font settings.
   */
  _defineProperty(this, "setFont", function () {
    _this2.fontStr = _this2.fontSize + 'px ' + _this2.font;
    _this2.textHeight = _this2.fontSize + Math.ceil(_this2.fontSize * 0.05);
  });
  /**
   * Gets the text position.
   */
  _defineProperty(this, "getTextPos", function () {
    if (_this2.align === 'left') {
      _this2.textPos = 2;
    } else if (_this2.align === 'right') {
      _this2.textPos = Math.floor(_this2.width - _this2.scrollBox.width - _this2.fontSize / 4);
    } else {
      _this2.textPos = Math.floor((_this2.width - -_this2.scrollBox.width) / 2);
    }
  });
  /**
   * Fits the text to the textbox.
   */
  _defineProperty(this, "fitText", function () {
    var ctx = _this2.ctx;
    _this2.cleanit(true); // MUST PASS TRUE or will recurse to call stack overflow
    ctx.font = _this2.fontStr;
    ctx.textAlign = _this2.align;
    ctx.textBaseline = 'top';
    var words = _this2.text.split(' ');
    _this2.lines.length = 0;
    var line = '';
    var space = '';
    while (words.length > 0) {
      var word = words.shift();
      var width = ctx.measureText(line + space + word).width;
      if (width < _this2.width - _this2.scrollBox.width - _this2.scrollBox.width - (_this2.portrait ? 84 : 0)) {
        line += space + word;
        space = ' ';
      } else {
        if (space === '') {
          // if one word too big put it in anyways
          line += word;
        } else {
          words.unshift(word);
        }
        _this2.lines.push(line);
        space = '';
        line = '';
      }
    }
    if (line !== '') {
      _this2.lines.push(line);
    }
    _this2.maxScroll = (_this2.lines.length + 0.5) * _this2.textHeight - _this2.height;
  });
  /**
   * Draws the textbox border.
   * @param {boolean} [portrait=false] - Whether to include portrait space.
   */
  _defineProperty(this, "drawBorder", function () {
    var portrait = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var ctx = _this2.ctx;
    var bw = _this2.border.lineWidth / 2;
    ctx.lineJoin = _this2.border.corner;
    ctx.lineWidth = _this2.border.lineWidth;
    ctx.strokeStyle = _this2.border.style;
    if (portrait) {
      ctx.strokeRect(_this2.x - bw + 84, _this2.y - bw, _this2.width + 2 * bw - 84, _this2.height + 2 * bw);
    } else {
      ctx.strokeRect(_this2.x - bw, _this2.y - bw, _this2.width + 2 * bw, _this2.height + 2 * bw);
    }
  });
  /**
   * Draws the scrollbar on the side.
   */
  _defineProperty(this, "drawScrollBox", function () {
    var ctx = _this2.ctx;
    var scale = _this2.height / (_this2.lines.length * _this2.textHeight);
    ctx.fillStyle = _this2.scrollBox.background;
    ctx.fillRect(_this2.x + _this2.width - _this2.scrollBox.width, _this2.y, _this2.scrollBox.width, _this2.height);
    ctx.fillStyle = _this2.scrollBox.color;
    var barsize = _this2.height * scale;
    if (barsize > _this2.height) {
      barsize = _this2.height;
    }
    ctx.fillRect(_this2.x + _this2.width - _this2.scrollBox.width, _this2.y - _this2.scrollY * scale, _this2.scrollBox.width, barsize);
  });
  /**
   * Draws the portrait.
   */
  _defineProperty(this, "drawPortrait", function () {
    var ctx = _this2.ctx;
    ctx.drawImage(_this2.portrait.image, _this2.x, _this2.y + 38, 76, 76);
  });
  /**
   * Scrolls to a position.
   * @param {number} pos - The scroll position.
   */
  _defineProperty(this, "scroll", function (pos) {
    _this2.cleanit();
    _this2.scrollY = -pos;
    if (_this2.scrollY > 0) {
      _this2.scrollY = 0;
    } else if (_this2.scrollY < -_this2.maxScroll) {
      _this2.scrollY = -_this2.maxScroll;
    }
  });
  /**
   * Scrolls by lines.
   * @param {number} x - The number of lines to scroll.
   */
  _defineProperty(this, "scrollLines", function (x) {
    _this2.cleanit();
    _this2.scrollY = -_this2.textHeight * x;
    if (_this2.scrollY > 0) {
      _this2.scrollY = 0;
    } else if (_this2.scrollY < -_this2.maxScroll) {
      _this2.scrollY = -_this2.maxScroll;
    }
  });
  /**
   * Renders the textbox.
   */
  _defineProperty(this, "render", function () {
    var ctx = _this2.ctx;
    _this2.cleanit();
    ctx.font = _this2.fontStr;
    ctx.textAlign = _this2.align;
    if (_this2.portrait) {
      _this2.drawBorder(true);
      _this2.drawPortrait();
      ctx.save(); // need this to reset the clip area
      ctx.fillStyle = _this2.background;
      ctx.fillRect(_this2.x + 84, _this2.y, _this2.width - 84, _this2.height);
    } else {
      _this2.drawBorder();
      ctx.save(); // need this to reset the clip area
      ctx.fillStyle = _this2.background;
      ctx.fillRect(_this2.x, _this2.y, _this2.width, _this2.height);
    }
    _this2.drawScrollBox();

    // Important text does not like being place at fractions of a pixel
    if (_this2.portrait) {
      ctx.beginPath();
      ctx.rect(_this2.x + 84, _this2.y, _this2.width - _this2.scrollBox.width - 84, _this2.height);
      ctx.clip();
      ctx.setTransform(1, 0, 0, 1, _this2.x + 84, Math.floor(_this2.y + _this2.scrollY));
    } else {
      ctx.beginPath();
      ctx.rect(_this2.x, _this2.y, _this2.width - _this2.scrollBox.width, _this2.height);
      ctx.clip();
      ctx.setTransform(1, 0, 0, 1, _this2.x, Math.floor(_this2.y + _this2.scrollY));
    }
    ctx.fillStyle = _this2.fontStyle;
    for (var i = 0; i < _this2.lines.length; i++) {
      // Important text does not like being place at fractions of a pixel
      ctx.fillText(_this2.lines[i], _this2.textPos, Math.floor(i * _this2.textHeight) + 2);
    }
    ctx.restore(); // remove the clipping
  });
  this.ctx = _ctx;
  this.dirty = true; // indicates that variouse setting need update
  this.scrollY = 0;
  this.fontSize = 24;
  this.font = 'minecraftia';
  this.align = 'left';
  this.background = '#333';
  this.border = {
    lineWidth: 2,
    style: '#fff',
    corner: 'round'
  };
  this.scrollBox = {
    width: 5,
    background: '#777',
    color: '#999'
  };
  this.fontStyle = '#fff';
  this.lines = [];
  this.x = 0;
  this.y = 0;
});