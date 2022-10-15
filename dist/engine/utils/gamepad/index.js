"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GamePad = void 0;

var _Controller = require("@Engine/utils/gamepad/Controller.jsx");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var GamePad = /*#__PURE__*/function () {
  // courtesy of https://stackoverflow.com/questions/44488996/create-a-scrollable-text-inside-canvas
  function GamePad(ctx) {
    _classCallCheck(this, GamePad);

    this.ctx = ctx;
    this.dirty = true;
    this.showTrace = true;
    this.showDebug = true;
    this.fontSize = ctx.canvas.width / 12;
    this.opacity = 0.4;
    this.font = "minecraftia"; // Start & Select Buttons

    this.start = false;
    this.select = false;
    this.touches = {};
    this.lastKey = new Date().getTime();
    this.listeners = [];
    this.map = {}; // Joystick Radius

    this.radius = ctx.canvas.width / 12; // Button placement

    this.button_offset = {
      x: this.radius * 2.5,
      y: 105
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
    this.controller = new _Controller.Controller(ctx, this.button_offset, this.touches, this.start, this.select, this.colours, this); // use custom round Rect shape
  } // initialize widget


  _createClass(GamePad, [{
    key: "init",
    value: function init() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      console.log("initing");
      this.setOptions(options);
      this.resize();
      this.loadCanvas();
    } // attach external event listener (spliced into)

  }, {
    key: "attachListener",
    value: function attachListener(listener) {
      return this.listeners.push(listener);
    } // removed an attached external event listener

  }, {
    key: "removeListener",
    value: function removeListener(id) {
      this.listeners.splice(id - 1, 1);
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
    } // debounce

  }, {
    key: "debounce",
    value: function debounce() {
      var controller = this.controller,
          buttons_layout = this.buttons_layout;
      var t = this.lastKey;
      this.lastKey = new Date().getTime() + 100; // todo - clear key

      for (var n = 0; n < buttons_layout.length; n++) {
        controller.buttons.reset(n);
      }

      return t < this.lastKey;
    } // debounce and check key

  }, {
    key: "keyPressed",
    value: function keyPressed(key) {
      return this.map[key] === 1 && this.debounce();
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

        var offset = this.getPosition(ctx.canvas); // run against attached listeners

        this.listeners.map(function (l) {
          if (l[type]) {
            return l[type](e);
          }
        });

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
          // handle controller
          switch (type) {
            case "touchstart":
            case "touchmove":
              this.disableScroll();
              controller.stick.state(id);

              if (new Date().getTime() > this.lastKey + 150) {
                for (var n = 0; n < buttons_layout.length; n++) {
                  controller.buttons.state(id, n);
                }

                this.lastKey = new Date().getTime();
              }

              break;

            case "touchend":
              for (var n = 0; n < buttons_layout.length; n++) {
                controller.buttons.reset(n);
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
}();

exports.GamePad = GamePad;