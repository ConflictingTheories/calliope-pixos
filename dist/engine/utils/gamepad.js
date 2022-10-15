"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GamePad = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

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

var GamePad = /*#__PURE__*/function () {
  // courtesy of https://stackoverflow.com/questions/44488996/create-a-scrollable-text-inside-canvas
  function GamePad(ctx) {
    _classCallCheck(this, GamePad);

    this.ctx = ctx;
    this.dirty = true;
    this.showTrace = true;
    this.showDebug = true;
    this.fontSize = 24;
    this.opacity = 0.4;
    this.font = "minecraftia"; // Start & Select Buttons

    this.start = true;
    this.select = true;
    this.touches = {};
    this.map = {}; // Joystick Radius

    this.radius = 40; // Button placement

    this.button_offset = {
      x: this.radius * 2.5,
      y: this.radius * 3
    }; // Button Colours

    this.colours = {
      red: "rgba(255,0,0,".concat(this.opacity, ")"),
      green: "rgba(5,220,30,".concat(this.opacity, ")"),
      blue: "rgba(5,30,220,".concat(this.opacity, ")"),
      purple: "rgba(240,5,240,".concat(this.opacity, ")"),
      yellow: "rgba(240,240,5,".concat(this.opacity, ")"),
      cyan: "rgba(5,240,240,".concat(this.opacity, ")"),
      black: "rgba(5,5,5,".concat(this.opacity, ")"),
      white: "rgba(250,250,250,".concat(this.opacity, ")"),
      joystick: {
        base: "rgba(0,0,0,".concat(this.opacity, ")"),
        dust: "rgba(0,0,0,".concat(this.opacity, ")"),
        stick: "rgba(214,214,214,1)",
        ball: "rgba(245,245,245,1)"
      }
    }; // Button Layouts

    var buttons_layout = [{
      x: -this.radius - this.radius / 2 + this.radius / 4,
      y: -this.radius / 4,
      r: 3 / 4 * this.radius,
      color: this.colours.red,
      name: "b"
    }, {
      x: this.radius - this.radius / 2,
      y: -(this.radius + this.radius / 2),
      r: 3 / 4 * this.radius,
      color: this.colours.green,
      name: "a"
    }, {
      x: this.radius - this.radius / 2,
      y: this.radius,
      r: 3 / 4 * this.radius,
      color: this.colours.blue,
      name: "x"
    }, {
      x: this.radius * 3 - this.radius / 2 - this.radius / 4,
      y: 0 - this.radius / 4,
      r: 3 / 4 * this.radius,
      color: this.colours.yellow,
      name: "y"
    }];

    if (this.start) {
      buttons_layout.push({
        color: this.colours.black,
        y: -55,
        w: 50,
        h: 15,
        name: "start"
      });
    }

    if (this.select) {
      buttons_layout.push({
        y: -55,
        w: 50,
        h: 15,
        color: this.colours.black,
        name: "select"
      });
    } // setup controller


    this.buttons_layout = buttons_layout;
    this.controller = new Controller(ctx, buttons_layout, this.button_offset, this.map, this.touches, this.start, this.select, this.colours, this); // use custom round Rect shape
  } // initialize widget


  _createClass(GamePad, [{
    key: "init",
    value: function init() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      console.log("initing");
      this.setOptions(options);
      this.resize();
      this.loadCanvas();
    } // check input status

  }, {
    key: "checkInput",
    value: function checkInput() {
      return this.map;
    } // Handle resize (TODO - needs work)

  }, {
    key: "resize",
    value: function resize() {
      this.width = this.ctx.canvas.width;
      this.height = this.ctx.canvas.height;
      this.controller.init();
    } // setup canvas

  }, {
    key: "loadCanvas",
    value: function loadCanvas() {
      var _this = this;

      var ctx = this.ctx,
          controller = this.controller,
          width = this.width,
          height = this.height;
      ctx.fillStyle = "rgba(70,70,70,0.5)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "minecraftia 14px";
      ctx.fillText("loading", width / 2, height / 2);
      controller.stick.draw();
      controller.buttons.draw();
      window.addEventListener("resize", function () {
        return _this.resize();
      });
      setTimeout(function () {
        this.ready = true;
      }, 250);
    } // Apply options

  }, {
    key: "setOptions",
    value: function setOptions(options) {
      var _this2 = this;

      Object.keys(this).forEach(function (key) {
        if (options[key] !== undefined) {
          _this2[key] = options[key];
          _this2.dirty = true;
        }
      });
    } // Event Listener

  }, {
    key: "listen",
    value: function listen(e) {
      var ctx = this.ctx,
          touches = this.touches,
          controller = this.controller,
          buttons_layout = this.buttons_layout;

      if (e.type) {
        var type = e.type;

        if (e.type.indexOf("mouse") != -1) {
          e.identifier = "desktop";
          e = {
            touches: [e]
          };
        }

        var offset = this.getPosition(ctx.canvas);

        for (var n = 0; n < (e.touches.length > 5 ? 5 : e.touches.length); n++) {
          var id = e.touches[n].identifier;

          if (!touches[id]) {
            touches[id] = {
              x: e.touches[n].pageX - offset.x,
              y: e.touches[n].pageY - offset.y
            };
          } else {
            touches[id].x = e.touches[n].pageX - offset.x;
            touches[id].y = e.touches[n].pageY - offset.y;
          }
        }

        for (var id in touches) {
          switch (type) {
            case "touchstart":
            case "touchmove":
              this.disableScroll();
              controller.stick.state(id);

              for (var n = 0; n < buttons_layout.length; n++) {
                controller.buttons.state(id, n);
              }

              break;

            case "mousedown":
            case "mousemove":
            case "mouseup":
              controller.stick.state(id, type);

              for (var n = 0; n < buttons_layout.length; n++) {
                controller.buttons.state(id, n, type);
              }

              break;
          }
        }

        if (e.type == "touchend") {
          var id = e.changedTouches[0].identifier;

          if (touches[id].id == "stick") {
            controller.stick.reset();
          }

          for (var n = 0; n < buttons_layout.length; n++) {
            if (touches[id].id == buttons_layout[n].name) {
              controller.buttons.reset(n);
            }
          }

          if (touches[id]) {
            delete touches[id];
          }

          if (e.changedTouches.length > e.touches.length) {
            var length = 0;
            var delta = e.changedTouches.length - e.touches.length;

            for (var id in touches) {
              if (length >= delta) {
                delete touches[id];
              }

              length++;
            }
          }

          if (e.touches.length == 0) {
            touches = {};

            for (var n = 0; n < buttons_layout.length; n++) {
              controller.buttons.reset(n);
            }

            controller.stick.reset();
          } // Enable Scroll Again


          this.enableScroll();
        }
      } else {
        var keys = e;
        var dir = 0;

        for (var prop in keys) {
          switch (prop) {
            case "%":
              //left
              if (keys[prop]) {
                dir += 1;
              }

              break;

            case "&":
              //up
              if (keys[prop]) {
                dir += 2;
              }

              break;

            case "'":
              //right
              if (keys[prop]) {
                dir += 4;
              }

              break;

            case "(":
              //down
              if (keys[prop]) {
                dir += 8;
              }

              break;

            default:
              if (keys[prop]) {
                for (var n = 0; n < buttons_layout.length; n++) {
                  if (buttons_layout[n].key) {
                    if (buttons_layout[n].key == prop) {
                      touches[buttons_layout[n].name] = {
                        id: buttons_layout[n].name,
                        x: buttons_layout[n]["hit"].x[0] + buttons_layout[n].w / 2,
                        y: buttons_layout[n]["hit"].y[0] + buttons_layout[n].h / 2
                      };
                      controller.buttons.state(buttons_layout[n].name, n, "mousedown");
                    }
                  }
                }
              } else {
                if (!keys[prop]) {
                  for (var n = 0; n < buttons_layout.length; n++) {
                    if (buttons_layout[n].key) {
                      if (buttons_layout[n].key == prop) {
                        controller.buttons.reset(n);
                        delete touches[buttons_layout[n].name];
                      }
                    }
                  }

                  delete keys[prop];
                }
              }

              break;
          }

          controller.stick.dx = controller.stick.x;
          controller.stick.dy = controller.stick.y;

          switch (dir) {
            case 1:
              //left
              controller.stick.dx = controller.stick.x - controller.stick.radius / 2;
              break;

            case 2:
              //up
              controller.stick.dy = controller.stick.y - controller.stick.radius / 2;
              break;

            case 3:
              //left up
              controller.stick.dx = controller.stick.x - controller.stick.radius / 2;
              controller.stick.dy = controller.stick.y - controller.stick.radius / 2;
              break;

            case 4:
              //right
              controller.stick.dx = controller.stick.x + controller.stick.radius / 2;
              break;

            case 6:
              //right up
              controller.stick.dx = controller.stick.x + controller.stick.radius / 2;
              controller.stick.dy = controller.stick.y - controller.stick.radius / 2;
              break;

            case 8:
              //down
              controller.stick.dy = controller.stick.y + controller.stick.radius / 2;
              break;

            case 9:
              //left down
              controller.stick.dx = controller.stick.x - controller.stick.radius / 2;
              controller.stick.dy = controller.stick.y + controller.stick.radius / 2;
              break;

            case 12:
              //right down
              controller.stick.dx = controller.stick.x + controller.stick.radius / 2;
              controller.stick.dy = controller.stick.y + controller.stick.radius / 2;
              break;

            default:
              controller.stick.dx = controller.stick.x;
              controller.stick.dy = controller.stick.y;
              break;
          }

          if (dir != 0) {
            touches["stick"] = {
              id: "stick"
            };
            controller.stick.state("stick", "mousemove");
          } else {
            controller.stick.reset();
            delete touches["stick"];
          }
        }
      }

      return this.map;
    } // Draw

  }, {
    key: "render",
    value: function render() {
      var ctx = this.ctx;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      if (this.showDebug) {
        this.debug();
      }

      if (this.showTrace) {
        this.trace();
      }

      this.controller.stick.draw();
      this.controller.buttons.draw();
    } // debug information

  }, {
    key: "debug",
    value: function debug() {
      var ctx = this.ctx,
          map = this.map,
          touches = this.touches;
      this.dy = 30;
      ctx.fillStyle = "rgba(70,70,70,0.5)";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = "minecraftia 20px";
      ctx.fillText("debug", 10, this.dy);
      ctx.font = "minecraftia 14px";
      this.dy += 5;

      for (var prop in touches) {
        this.dy += 10;
        var text = prop + " : " + JSON.stringify(touches[prop]).slice(1, -1);
        ctx.fillText(text, 10, this.dy);
      }
    } // map trace output

  }, {
    key: "trace",
    value: function trace() {
      var ctx = this.ctx,
          map = this.map;
      this.dy = 30;
      ctx.fillStyle = "rgba(70,70,70,0.5)";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.font = "minecraftia 20px";
      ctx.fillText("trace", this.width - 10, this.dy);
      ctx.font = "minecraftia 14px";
      this.dy += 5;

      for (var prop in map) {
        this.dy += 10;
        var text = prop + " : " + map[prop];
        ctx.fillText(text, this.width - 10, this.dy);
      }
    } // get position with correct offset

  }, {
    key: "getPosition",
    value: function getPosition(element) {
      var xPosition = 0;
      var yPosition = 0;

      while (element) {
        xPosition += element.offsetLeft - element.scrollLeft + element.clientLeft;
        yPosition += element.offsetTop - element.scrollTop + element.clientTop;
        element = element.offsetParent;
      }

      return {
        x: xPosition,
        y: yPosition
      };
    } // disable scroll while touching canvas

  }, {
    key: "enableScroll",
    value: function enableScroll() {
      document.body.removeEventListener("touchmove", this.preventDefault);
    } // reenable once done

  }, {
    key: "disableScroll",
    value: function disableScroll() {
      document.body.addEventListener("touchmove", this.preventDefault, {
        passive: false
      }); // document.body.addEventListener("touchstart", this.preventDefault, { passive: false });
    } // stop event

  }, {
    key: "preventDefault",
    value: function preventDefault(e) {
      e.preventDefault();
      e.stopPropagation();
    }
  }]);

  return GamePad;
}(); // Controller Manager for Gamepad


exports.GamePad = GamePad;

var Controller = /*#__PURE__*/function () {
  function Controller(ctx, buttons_layout, button_offset, map, touches, start, select, colours, gamepad) {
    _classCallCheck(this, Controller);

    this.ctx = ctx;
    this.gamepad = gamepad;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
    this.radius = 60;
    this.touches = touches;
    this.map = map;
    this.start = start;
    this.select = select;
    this.buttons_layout = buttons_layout;
    this.button_offset = button_offset;
    this.colours = colours;
    this.layout = {
      x: this.width - this.button_offset.x,
      y: this.height - this.button_offset.y
    };
    this.stick = new ControllerStick(this.ctx, this.layout, this.map, this.touches, this.colours, this.radius, this.gamepad);
    this.buttons = new ControllerButtons(this.ctx, this.layout, buttons_layout, this.map, this.touches, this.start, this.select, this.colours, this.radius, this.gamepad);
    console.log("loading Controller Manager - ", this);
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
}(); // Controller Joystick Manager


var ControllerStick = /*#__PURE__*/function () {
  function ControllerStick(ctx, layout, map, touches, colours, radius, gamepad) {
    _classCallCheck(this, ControllerStick);

    this.ctx = ctx;
    this.gamepad = gamepad;
    this.map = map;
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
    console.log("loading Controller Joystick - ", this);
  } // Initialize


  _createClass(ControllerStick, [{
    key: "init",
    value: function init() {
      var map = this.map,
          layout = this.layout,
          width = this.width,
          ctx = this.ctx;
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
      var dist = parseInt(Math.sqrt(dx * dx + dy * dy));

      if (dist < this.radius * 1.5) {
        if (!type) {
          touches[id].id = "stick";
        } else {
          switch (type) {
            case "mousedown":
              touches[id].id = "stick";
              break;

            case "mouseup":
              delete touches[id].id;
              this.reset();
              break;
          }
        }
      }

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

        if (dist > this.radius * 1.5) {
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
}(); // Controller Button Manager


var ControllerButtons = /*#__PURE__*/function () {
  function ControllerButtons(ctx, layout, buttons_layout, map, touches, start, select, colours, radius, gamepad) {
    _classCallCheck(this, ControllerButtons);

    this.ctx = ctx;
    this.gamepad = gamepad;
    this.layout = layout;
    this.map = map;
    this.radius = radius;
    this.touches = touches;
    this.buttons_layout = buttons_layout;
    this.start = start;
    this.select = select;
    this.colours = colours;
    console.log("loading Controller Buttons - ", this);
  } // Initialize


  _createClass(ControllerButtons, [{
    key: "init",
    value: function init() {
      var buttons_layout = this.buttons_layout,
          layout = this.layout,
          ctx = this.ctx;
      var width = ctx.canvas.width;

      for (var n = 0; n < buttons_layout.length; n++) {
        var button = buttons_layout[n];
        var x = layout.x - button.x;
        var y = layout.y - button.y;

        if (button.r) {
          var r = button.r;
          buttons_layout[n]["hit"] = {
            x: [x - r, x + r * 2],
            y: [y - r, y + r * 2],
            active: false
          };
        } else {
          button.x = width / 2 - button.w;

          if (this.start && this.select) {
            switch (button.name) {
              case "select":
                button.x = width / 2 - button.w - button.h * 2;
                break;

              case "start":
                button.x = width / 2;
                break;
            }
          }

          var x = button.x;
          var y = layout.y - button.y;
          buttons_layout[n]["hit"] = {
            x: [x, x + button.w],
            y: [y, y + button.h],
            active: false
          };
        }

        this.gamepad.map[button.name] = 0;
      }
    } // render Button

  }, {
    key: "draw",
    value: function draw() {
      var ctx = this.ctx,
          layout = this.layout;

      for (var n = 0; n < this.buttons_layout.length; n++) {
        var button = this.buttons_layout[n];
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
          ctx.fillStyle = "rgba(255,255,255,1)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "minecraftia 12px";
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
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "minecraftia 12px";
          ctx.fillText(button.name, x + w / 2, y + h * 2);
        }

        if (button.key && hint) {
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "minecraftia 12px";

          if (button.name == "start" || button.name == "select") {
            x += w / 2;
          }

          ctx.fillText(button.key, x, y - r * 1.5);
        }
      }
    } // State of Buttons

  }, {
    key: "state",
    value: function state(id, n, type) {
      var gamepad = this.gamepad;
      var touches = gamepad.touches,
          checkInput = gamepad.checkInput,
          width = gamepad.width;

      if (touches[id].id != "stick") {
        var touch = {
          x: touches[id].x,
          y: touches[id].y
        };
        var button = this.buttons_layout[n];
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

        if (dist < this.radius && touches[id].id != "stick") {
          if (!type) {
            touches[id].id = name;
          } else {
            switch (type) {
              case "mousedown":
                touches[id].id = name;
                break;

              case "mouseup":
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

          if (typeof checkInput === "function") {
            this.gamepad.checkInput();
          }
        }
      }
    } // Reset State

  }, {
    key: "reset",
    value: function reset(n) {
      var button = this.buttons_layout[n];
      var name = button.name;
      button.hit.active = false;
      this.gamepad.map[name] = 0;
    }
  }]);

  return ControllerButtons;
}();