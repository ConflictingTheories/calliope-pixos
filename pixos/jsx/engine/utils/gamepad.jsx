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
export class GamePad {
  // courtesy of https://stackoverflow.com/questions/44488996/create-a-scrollable-text-inside-canvas
  constructor(ctx) {
    this.ctx = ctx;
    this.dirty = true;
    this.showTrace = true;
    this.showDebug = true;
    this.fontSize = ctx.canvas.width / 12;
    this.opacity = 0.4;
    this.font = "minecraftia";
    // Start & Select Buttons
    this.start = true;
    this.select = true;
    this.touches = {};
    this.map = {};
    // Joystick Radius
    this.radius = ctx.canvas.width / 12;
    // Button placement
    this.button_offset = { x: this.radius * 2.5, y: 105};
    // Button Colours
    this.colours = {
      red: `rgba(255,0,0,${this.opacity})`,
      green: `rgba(5,220,30,${this.opacity})`,
      blue: `rgba(5,30,220,${this.opacity})`,
      purple: `rgba(240,5,240,${this.opacity})`,
      yellow: `rgba(240,240,5,${this.opacity})`,
      cyan: `rgba(5,240,240,${this.opacity})`,
      black: `rgba(5,5,5,${this.opacity})`,
      white: `rgba(250,250,250,${this.opacity})`,
      joystick: {
        base: `rgba(0,0,0,${this.opacity})`,
        dust: `rgba(0,0,0,${this.opacity})`,
        stick: `rgba(214,214,214,1)`,
        ball: `rgba(245,245,245,1)`,
      },
    };
    // Button Layouts
    let buttons_layout = [
      {
        x: -this.radius - this.radius / 2 + this.radius / 4,
        y: -this.radius / 4,
        r: (3 / 4) * this.radius,
        color: this.colours.red,
        name: "b",
      },
      {
        x: this.radius - this.radius / 2,
        y: -(this.radius + this.radius / 2),
        r: (3 / 4) * this.radius,
        color: this.colours.green,
        name: "a",
      },
      {
        x: this.radius - this.radius / 2,
        y: this.radius,
        r: (3 / 4) * this.radius,
        color: this.colours.blue,
        name: "x",
      },
      {
        x: this.radius * 3 - this.radius / 2 - this.radius / 4,
        y: 0 - this.radius / 4,
        r: (3 / 4) * this.radius,
        color: this.colours.yellow,
        name: "y",
      },
    ];
    if (this.start) {
      buttons_layout.push({
        color: this.colours.black,
        y: -55,
        w: 50,
        h: 15,
        name: "start",
      });
    }
    if (this.select) {
      buttons_layout.push({
        y: -55,
        w: 50,
        h: 15,
        color: this.colours.black,
        name: "select",
      });
    }
    // setup controller
    this.buttons_layout = buttons_layout;
    this.controller = new Controller(
      ctx,
      buttons_layout,
      this.button_offset,
      this.map,
      this.touches,
      this.start,
      this.select,
      this.colours,
      this
    );
    // use custom round Rect shape
  }
  // initialize widget
  init(options = {}) {
    console.log("initing");
    this.setOptions(options);
    this.resize();
    this.loadCanvas();
  }

  // check input status
  checkInput() {
    return this.map;
  }

  // Handle resize (TODO - needs work)
  resize() {
    this.width = this.ctx.canvas.width;
    this.height = this.ctx.canvas.height;
    this.controller.init();
  }

  // setup canvas
  loadCanvas() {
    let { ctx, controller, width, height } = this;
    ctx.fillStyle = "rgba(70,70,70,0.5)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "minecraftia 14px";
    ctx.fillText("loading", width / 2, height / 2);
    controller.stick.draw();
    controller.buttons.draw();
    window.addEventListener("resize", () => this.resize());
    setTimeout(function () {
      this.ready = true;
    }, 250);
  }

  // Apply options
  setOptions(options) {
    Object.keys(this).forEach((key) => {
      if (options[key] !== undefined) {
        this[key] = options[key];
        this.dirty = true;
      }
    });
  }

  // Event Listener
  listen(e) {
    let { ctx, touches, controller, buttons_layout } = this;
    if (e.type) {
      var type = e.type;
      if (e.type.indexOf("mouse") != -1) {
        e.identifier = "desktop";
        e = { touches: [e] };
      }
      let offset = this.getPosition(ctx.canvas);
      for (var n = 0; n < (e.touches.length > 5 ? 5 : e.touches.length); n++) {
        var id = e.touches[n].identifier;
        if (!touches[id]) {
          touches[id] = {
            x: e.touches[n].pageX - offset.x,
            y: e.touches[n].pageY - offset.y,
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
        }

        // Enable Scroll Again
        this.enableScroll();
      }
    } else {
      var keys = e;
      var dir = 0;
      for (var prop in keys) {
        switch (prop) {
          case "%": //left
            if (keys[prop]) {
              dir += 1;
            }
            break;
          case "&": //up
            if (keys[prop]) {
              dir += 2;
            }
            break;
          case "'": //right
            if (keys[prop]) {
              dir += 4;
            }
            break;
          case "(": //down
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
                      y: buttons_layout[n]["hit"].y[0] + buttons_layout[n].h / 2,
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
          case 1: //left
            controller.stick.dx = controller.stick.x - controller.stick.radius / 2;
            break;
          case 2: //up
            controller.stick.dy = controller.stick.y - controller.stick.radius / 2;
            break;
          case 3: //left up
            controller.stick.dx = controller.stick.x - controller.stick.radius / 2;
            controller.stick.dy = controller.stick.y - controller.stick.radius / 2;
            break;
          case 4: //right
            controller.stick.dx = controller.stick.x + controller.stick.radius / 2;
            break;
          case 6: //right up
            controller.stick.dx = controller.stick.x + controller.stick.radius / 2;
            controller.stick.dy = controller.stick.y - controller.stick.radius / 2;
            break;
          case 8: //down
            controller.stick.dy = controller.stick.y + controller.stick.radius / 2;
            break;
          case 9: //left down
            controller.stick.dx = controller.stick.x - controller.stick.radius / 2;
            controller.stick.dy = controller.stick.y + controller.stick.radius / 2;
            break;
          case 12: //right down
            controller.stick.dx = controller.stick.x + controller.stick.radius / 2;
            controller.stick.dy = controller.stick.y + controller.stick.radius / 2;
            break;
          default:
            controller.stick.dx = controller.stick.x;
            controller.stick.dy = controller.stick.y;
            break;
        }
        if (dir != 0) {
          touches["stick"] = { id: "stick" };
          controller.stick.state("stick", "mousemove");
        } else {
          controller.stick.reset();
          delete touches["stick"];
        }
      }
    }

    return this.map;
  }

  // Draw
  render() {
    let { ctx } = this;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (this.showDebug) {
      this.debug();
    }
    if (this.showTrace) {
      this.trace();
    }
    this.controller.stick.draw();
    this.controller.buttons.draw();
  }

  // debug information
  debug() {
    let { ctx, map, touches } = this;
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
      let text = prop + " : " + JSON.stringify(touches[prop]).slice(1, -1);
      ctx.fillText(text, 10, this.dy);
    }
  }

  // map trace output
  trace() {
    let { ctx, map } = this;
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
      let text = prop + " : " + map[prop];
      ctx.fillText(text, this.width - 10, this.dy);
    }
  }

  // get position with correct offset
  getPosition(element) {
    var xPosition = 0;
    var yPosition = 0;

    while (element) {
      xPosition += element.offsetLeft - element.scrollLeft + element.clientLeft;
      yPosition += element.offsetTop - element.scrollTop + element.clientTop;
      element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
  }

  // disable scroll while touching canvas
  enableScroll() {
    document.body.removeEventListener("touchmove", this.preventDefault);
  }

  // reenable once done
  disableScroll() {
    document.body.addEventListener("touchmove", this.preventDefault, { passive: false });
    // document.body.addEventListener("touchstart", this.preventDefault, { passive: false });
  }

  // stop event
  preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();
  }
}

// Controller Manager for Gamepad
class Controller {
  constructor(ctx, buttons_layout, button_offset, map, touches, start, select, colours, gamepad) {
    this.ctx = ctx;
    this.gamepad = gamepad;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
    this.radius = ctx.canvas.width / 10;
    this.touches = touches;
    this.map = map;
    this.start = start;
    this.select = select;
    this.buttons_layout = buttons_layout;
    this.button_offset = button_offset;
    this.colours = colours;
    this.layout = { x: this.width - this.button_offset.x, y: this.height - this.button_offset.y };
    this.stick = new ControllerStick(this.ctx, this.layout, this.map, this.touches, this.colours, this.radius, this.gamepad);
    this.buttons = new ControllerButtons(
      this.ctx,
      this.layout,
      buttons_layout,
      this.map,
      this.touches,
      this.start,
      this.select,
      this.colours,
      this.radius,
      this.gamepad
    );
    console.log("loading Controller Manager - ", this);
  }
  // Initialize
  init() {
    this.stick.init();
    this.buttons.init();
  }
  // draw
  draw() {
    this.stick.draw();
    this.buttons.draw();
  }
}

// Controller Joystick Manager
class ControllerStick {
  constructor(ctx, layout, map, touches, colours, radius, gamepad) {
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
  }
  // Initialize
  init() {
    let { map, layout, width, ctx } = this;
    this.x = width - layout.x;
    this.y = layout.y + (3 * this.radius) / 8;
    this.dx = this.x;
    this.dy = this.y;
    this.gamepad.map["x-dir"] = 0;
    this.gamepad.map["y-dir"] = 0;
    this.gamepad.map["x-axis"] = 0;
    this.gamepad.map["y-axis"] = 0;
  }
  // draw joystick
  draw() {
    let { ctx } = this;
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
  }
  // manage event state
  state(id, type) {
    let { gamepad } = this;
    let { touches, map, checkInput } = gamepad;
    var touch = {
      x: touches[id].x,
      y: touches[id].y,
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
  }
  // reset state
  reset() {
    let { map } = this.gamepad;
    this.dx = this.x;
    this.dy = this.y;
    map["x-dir"] = 0;
    map["y-dir"] = 0;
    map["x-axis"] = 0;
    map["y-axis"] = 0;
  }
}

// Controller Button Manager
class ControllerButtons {
  constructor(ctx, layout, buttons_layout, map, touches, start, select, colours, radius, gamepad) {
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
  }
  // Initialize
  init() {
    let { buttons_layout, layout, ctx } = this;
    let width = ctx.canvas.width;
    for (var n = 0; n < buttons_layout.length; n++) {
      var button = buttons_layout[n];
      var x = layout.x - button.x;
      var y = layout.y - button.y;
      if (button.r) {
        var r = button.r;
        buttons_layout[n]["hit"] = { x: [x - r, x + r * 2], y: [y - r, y + r * 2], active: false };
      } else {
        button.x = width / 3 - button.w;
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
        buttons_layout[n]["hit"] = { x: [x, x + button.w], y: [y, y + button.h], active: false };
      }
      this.gamepad.map[button.name] = 0;
    }
  }
  // render Button
  draw() {
    let { ctx, layout } = this;
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
  }
  // State of Buttons
  state(id, n, type) {
    let { gamepad } = this;
    let { touches, checkInput, width } = gamepad;
    if (touches[id].id != "stick") {
      var touch = {
        x: touches[id].x,
        y: touches[id].y,
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
  }
  // Reset State
  reset(n) {
    var button = this.buttons_layout[n];
    var name = button.name;
    button.hit.active = false;
    this.gamepad.map[name] = 0;
  }
}
