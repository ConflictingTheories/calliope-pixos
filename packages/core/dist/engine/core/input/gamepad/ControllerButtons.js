"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ControllerButtons = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
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

// Mobile Gamepad Controller
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
};

// Controller Button Manager
var ControllerButtons = exports.ControllerButtons = /*#__PURE__*/function () {
  /**
   * Creates an instance of ControllerButtons.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @param {Object} layout - The layout object for positioning.
   * @param {Object.<string, any>} touches - The touch state object.
   * @param {boolean} start - Whether start button is enabled.
   * @param {boolean} select - Whether select button is enabled.
   * @param {Object.<string, string>} colours - The color scheme.
   * @param {number} radius - The radius for buttons.
   * @param {GamePad} gamepad - The parent gamepad instance.
   */
  function ControllerButtons(ctx, layout, touches, start, select, colours, radius, gamepad) {
    _classCallCheck(this, ControllerButtons);
    /** @type {CanvasRenderingContext2D} */
    this.ctx = ctx;
    /** @type {GamePad} */
    this.gamepad = gamepad;
    /** @type {Object} */
    this.layout = layout;
    /** @type {number} */
    this.radius = radius;
    /** @type {Object.<string, any>} */
    this.touches = touches;
    /** @type {boolean} */
    this.start = start;
    /** @type {boolean} */
    this.select = select;
    /** @type {Object.<string, string>} */
    this.colours = colours;
  }
  /**
   * Initializes the button layouts and hit areas.
   */
  return _createClass(ControllerButtons, [{
    key: "init",
    value: function init() {
      var layout = this.layout,
        ctx = this.ctx;
      var buttonsLayout = this.gamepad.buttonsLayout;
      var width = ctx.canvas.width;
      for (var n = 0; n < buttonsLayout.length; n++) {
        var button = buttonsLayout[n];
        var x = layout.x - button.x;
        var y = layout.y - button.y;
        if (button.r) {
          var r = button.r;
          buttonsLayout[n]['hit'] = {
            x: [x - r, x + r * 2],
            y: [y - r, y + r * 2],
            active: false
          };
        } else {
          button.x = width / 3 - button.w;
          if (this.start && this.select) {
            switch (button.name) {
              case 'select':
                button.x = width / 2 - button.w - button.h * 2;
                break;
              case 'start':
                button.x = width / 2;
                break;
            }
          }
          var x = button.x;
          var y = layout.y - button.y;
          buttonsLayout[n]['hit'] = {
            x: [x, x + button.w],
            y: [y, y + button.h],
            active: false
          };
        }
        this.gamepad.map[button.name] = 0;
      }
    }
    /**
     * Renders the buttons on the canvas.
     */
  }, {
    key: "draw",
    value: function draw() {
      var ctx = this.ctx,
        layout = this.layout;
      for (var n = 0; n < this.gamepad.buttonsLayout.length; n++) {
        var button = this.gamepad.buttonsLayout[n];
        var color = button.color;
        var x = layout.x - button.x;
        var y = layout.y - button.y;
        button.dx = x;
        button.dy = y;
        if (button.r) {
          var r = button.r;
          if (button.hit) {
            if (button.hit.active) {
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(x, y, r + 5, 0, 2 * Math.PI, false);
              ctx.fill();
              ctx.closePath();
            }
          }
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, 2 * Math.PI, false);
          ctx.fill();
          ctx.closePath();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,1)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = 'minecraftia 12px';
          ctx.fillText(button.name, x, y);
        } else {
          var w = button.w;
          var h = button.h;
          var x = isNaN(button.x) ? ctx.canvas.width / 2 : button.x;
          var r = 10;
          ctx.fillStyle = color;
          if (button.hit) {
            if (button.hit.active) {
              ctx.roundRect(x - 5, y - 5, w + 10, h + 10, r * 2).fill();
            }
          }
          ctx.roundRect(x, y, w, h, r).fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = 'minecraftia 12px';
          ctx.fillText(button.name, x + w / 2, y + h * 2);
        }
        if (button.key) {
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = 'minecraftia 12px';
          if (button.name == 'start' || button.name == 'select') {
            x += w / 2;
          }
          ctx.fillText(button.key, x, y - r * 1.5);
        }
      }
    }
    /**
     * Updates the state of a button based on touch input.
     * @param {string} id - The touch identifier.
     * @param {number} n - The button index.
     * @param {string} [type] - The event type.
     */
  }, {
    key: "state",
    value: function state(id, n, type) {
      var gamepad = this.gamepad;
      var touches = gamepad.touches,
        checkInput = gamepad.checkInput,
        width = gamepad.width;
      if (touches[id].id != 'stick') {
        var touch = {
          x: touches[id].x,
          y: touches[id].y
        };
        var button = this.gamepad.buttonsLayout[n];
        var name = button.name;
        var dx = parseInt(touch.x - button.dx);
        var dy = parseInt(touch.y - button.dy);
        var dist = width;
        if (button.r) {
          dist = parseInt(Math.sqrt(dx * dx + dy * dy));
        } else {
          if (touch.x > button.hit.x[0] && touch.x < button.hit.x[1] && touch.y > button.hit.y[0] && touch.y < button.hit.y[1]) {
            dist = 0;
          }
        }
        if (dist < this.radius && touches[id].id != 'stick') {
          if (!type) {
            touches[id].id = name;
          } else {
            switch (type) {
              case 'mousedown':
                touches[id].id = name;
                break;
              case 'mouseup':
                delete touches[id].id;
                this.reset(n);
                break;
            }
          }
        }
        if (touches[id].id == name) {
          this.gamepad.map[name] = 1;
          button.hit.active = true;
          if (dist > this.radius) {
            button.hit.active = false;
            this.gamepad.map[name] = 0;
            delete touches[id].id;
          }
          if (typeof checkInput === 'function') {
            this.gamepad.checkInput();
          }
        }
      }
    }
    /**
     * Resets the state of a button.
     * @param {number} n - The button index.
     */
  }, {
    key: "reset",
    value: function reset(n) {
      this.gamepad.buttonsLayout[n].hit.active = false;
      this.gamepad.map[this.gamepad.buttonsLayout[n].name] = 0;
    }
  }]);
}();