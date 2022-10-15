"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ControllerStick = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2022 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
// Controller Joystick Manager
var ControllerStick = /*#__PURE__*/function () {
  function ControllerStick(ctx, layout, touches, colours, radius, gamepad) {
    _classCallCheck(this, ControllerStick);

    this.ctx = ctx;
    this.gamepad = gamepad;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
    this.layout = layout;
    this.touches = touches;
    this.radius = radius;
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.gamepad.map["x-dir"] = 0;
    this.gamepad.map["y-dir"] = 0;
    this.gamepad.map["x-axis"] = 0;
    this.gamepad.map["y-axis"] = 0;
    this.colours = colours;
    this.init = this.init.bind(this);
    this.draw = this.draw.bind(this);
  } // Initialize


  _createClass(ControllerStick, [{
    key: "init",
    value: function init() {
      var layout = this.layout,
          width = this.width;
      this.x = width - layout.x;
      this.y = layout.y + 3 * this.radius / 8;
      this.dx = this.x;
      this.dy = this.y;
      this.gamepad.map["x-dir"] = 0;
      this.gamepad.map["y-dir"] = 0;
      this.gamepad.map["x-axis"] = 0;
      this.gamepad.map["y-axis"] = 0;
    } // draw joystick

  }, {
    key: "draw",
    value: function draw() {
      var ctx = this.ctx;
      ctx.fillStyle = this.colours.joystick.base;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.closePath();
      ctx.fillStyle = this.colours.joystick.dust;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius - 5, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.closePath();
      ctx.fillStyle = this.colours.joystick.stick;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.closePath();
      ctx.fillStyle = this.colours.joystick.ball;
      ctx.beginPath();
      ctx.arc(this.dx, this.dy, this.radius - 10, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.closePath();
    } // manage event state

  }, {
    key: "state",
    value: function state(id, type) {
      var gamepad = this.gamepad;
      var touches = gamepad.touches,
          map = gamepad.map,
          checkInput = gamepad.checkInput;
      var touch = {
        x: touches[id].x,
        y: touches[id].y
      };
      var dx = parseInt(touch.x - this.x);
      var dy = parseInt(touch.y - this.y);
      var dist = parseInt(Math.sqrt(dx * dx + dy * dy)); // Start

      if (dist < this.radius * 1.2) {
        if (!type) {
          touches[id].id = "stick";
        } else {
          switch (type) {
            case "mousedown":
              touches[id].id = "stick";
              break;
          }
        }
      } // Stop


      if (dist < this.radius * 2.5) {
        if (!type) {
          touches[id].id = "stick";
        } else {
          if (touches[id].id == "stick") switch (type) {
            case "mouseup":
              delete touches[id].id;
              this.reset();
              break;
          }
        }
      } // Move


      if (touches[id].id == "stick") {
        if (Math.abs(parseInt(dx)) < this.radius / 2) {
          this.dx = this.x + dx;
        }

        if (Math.abs(parseInt(dy)) < this.radius / 2) {
          this.dy = this.y + dy;
        }

        map["x-axis"] = (this.dx - this.x) / (this.radius / 2);
        map["y-axis"] = (this.dy - this.y) / (this.radius / 2);
        map["x-dir"] = Math.round(map["x-axis"]);
        map["y-dir"] = Math.round(map["y-axis"]);

        if (dist > this.radius * 2.5) {
          this.reset();
          delete touches[id].id;
        }

        if (typeof checkInput === "function") {
          this.gamepad.checkInput();
        }
      }
    } // reset state

  }, {
    key: "reset",
    value: function reset() {
      var map = this.gamepad.map;
      this.dx = this.x;
      this.dy = this.y;
      map["x-dir"] = 0;
      map["y-dir"] = 0;
      map["x-axis"] = 0;
      map["y-axis"] = 0;
    }
  }]);

  return ControllerStick;
}();

exports.ControllerStick = ControllerStick;