"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Controller = void 0;

var _ControllerStick = require("@Engine/utils/gamepad/ControllerStick.jsx");

var _ControllerButtons = require("@Engine/utils/gamepad/ControllerButtons.jsx");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

// Controller Manager for Gamepad
var Controller = /*#__PURE__*/function () {
  function Controller(ctx, button_offset, touches, start, select, colours, gamepad) {
    _classCallCheck(this, Controller);

    this.ctx = ctx;
    this.gamepad = gamepad;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
    this.radius = ctx.canvas.width / 10;
    this.touches = touches;
    this.start = start;
    this.select = select;
    this.button_offset = button_offset;
    this.colours = colours;
    this.layout = {
      x: this.width - this.button_offset.x,
      y: this.height - this.button_offset.y
    };
    this.stick = new _ControllerStick.ControllerStick(this.ctx, this.layout, this.touches, this.colours, this.radius, this.gamepad);
    this.buttons = new _ControllerButtons.ControllerButtons(this.ctx, this.layout, this.touches, this.start, this.select, this.colours, this.radius, this.gamepad);
  } // Initialize


  _createClass(Controller, [{
    key: "init",
    value: function init() {
      this.stick.init();
      this.buttons.init();
    } // draw

  }, {
    key: "draw",
    value: function draw() {
      this.stick.draw();
      this.buttons.draw();
    }
  }]);

  return Controller;
}();

exports.Controller = Controller;